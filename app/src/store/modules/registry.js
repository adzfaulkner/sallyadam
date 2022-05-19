import currency from "currency.js";
import axios from 'axios';

export const COMPONENT_SUCCESS = 'success';
export const COMPONENT_LIST = 'list';
export const COMPONENT_CONFIRMATION = 'confirmation';
export const COMPONENT_REDIRECT_WAIT = 'redirectWait';
const CURRENCY = "GBP";
const CURRENCY_SYMBOL = "£";

const STEP_ONE = 'step_one';
const STEP_TWO = 'step_two';
export const STEP_THREE = 'step_three';
const FEE_PER = 0.014; // 1.4%
const FEE_PENCE = 20; // 20p

const initialState = {
    contributions: {}, // step one
    contributionTotal: 0, // step one & two
    contributionsUuids: [], // step two
    completedStages: [],
    extra: 0, // step two
    payFee: false, // step two
    message: null, // step two
    email: null, //step two
    redirectWait: false, // step two
};

const state = {
    ...initialState
};

function CalculateExtra(payFee, total) {
    if (!payFee) {
        return 0;
    }

    return (total * FEE_PER) + FEE_PENCE;
}

function CalculateTotal(contributions) {
    let total = 0;

    Object.values(contributions).forEach(amount =>{
        total += amount;
    });

    return total;
}

function ContributionsToCurrency(contribs) {
    const contributions = {}

    Object.keys(contribs).forEach(key =>{
        contributions[key] = currency(contribs[key], { fromCents: true, symbol: CURRENCY_SYMBOL });
    });

    return contributions;
}

export const getters = {
    Contributions: (state) => { 
        return ContributionsToCurrency(state.contributions);
    },
    HasContributions: (state) => state.contributionTotal > 0,
    ContributionTotal: (state) => {
        return currency(state.contributionTotal + state.extra, { fromCents: true, symbol: CURRENCY_SYMBOL });
    },
    RenderComponent: (state) => {
        const { completedStages, redirectWait } = state;

        if (completedStages[completedStages.length - 1] === STEP_THREE) {
            return COMPONENT_SUCCESS;
        }

        if (completedStages.length === 0) {
            return COMPONENT_LIST;
        }

        if (completedStages.length === 1) {
            return COMPONENT_CONFIRMATION;
        }

        if (redirectWait) {
            return COMPONENT_REDIRECT_WAIT;
        }
    },
    Message: (state) => state.message,
    PayFee: (state) => state.payFee,
    Email: (state) => state.email,
};

export const actions = {
    async ResetRegistry({commit}) {
        await commit("reset");
    },
    async AddContribution({commit}, input) {
        await commit("addContribution", input);
    },
    async NextStep({commit, dispatch}) {
        await commit("nextStep");
        dispatch("Checkout");
    },
    async PayFee({commit}, decision) {
        await commit("payFee", decision);
    },
    async MessageAdded({commit}, message) {
        await commit("messageAdded", message);
    },
    async EmailAdded({commit}, email) {
        await commit("emailAdded", email);
    },
    async LastStep({commit}) {
        await commit("lastStep");
    },
    async Checkout({state, dispatch, commit}) {
        const { completedStages } = state;

        if (
            completedStages.length === 0 
            || completedStages[completedStages.length-1] !== STEP_TWO
        ) {
            return;
        }

        await commit('redirectWait', true);

        const contribs = ContributionsToCurrency(state.contributions);
        const items = [];

        for (let uuid of state.contributionsUuids) {
            if (contribs[uuid].intValue > 0) {
                items.push({
                    uuid: uuid,
                    amount: contribs[uuid].intValue
                });
            }
        }
        const extra = currency(state.extra, { fromCents: true, symbol: CURRENCY_SYMBOL });
        const payload = {
            items,
            currency: CURRENCY,
            message: state.message,
            extra: extra.intValue,
            email: state.email,
        };

        try {
            const response = await axios.post("/checkout", JSON.stringify(payload), {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const {url} = response.data;
            window.location = url;
            dispatch("LastStep");
            await commit('redirectWait', false);
        } catch (e) {
            await commit('redirectWait', false);

            if (e.response.status === 403) {
                dispatch("LogOut");
                dispatch("LoginError", "Session expired. Please log back in.");
                dispatch("LastStep");
                return;
            }

            throw e
        }
    },
    async SuccessfulPayment({commit}) {
        await commit('success');
    },
};

export const mutations = {
    reset(state) {
        Object.assign(state, initialState)
    },
    addContribution(state, input) {
        const { uuid, amount } = input;

        state.contributions = {
            ...state.contributions,
            [uuid]: amount.intValue,
        }

        state.contributionTotal = CalculateTotal(state.contributions);
        state.extra = CalculateExtra(state.payFee, state.contributionTotal);

        if (state.contributionsUuids.indexOf(uuid) < 0) {
            state.contributionsUuids = [
                ...state.contributionsUuids,
                uuid
            ];
        }
    },
    nextStep(state) {
        if (!getters.HasContributions(state)) {
            return;
        }

        if (state.completedStages.length === 1) {
            state.completedStages = [
                ...state.completedStages, 
                STEP_TWO
            ];
        }

        if (state.completedStages.length === 0) {
            state.completedStages = [STEP_ONE];
        }
    },
    payFee(state, decision) {
        state.payFee = decision === true;
        state.extra = CalculateExtra(state.payFee, state.contributionTotal);
    },
    messageAdded(state, message) {
        state.message = message;
    },
    emailAdded(state, email) {
        state.email = email;
    },
    lastStep(state) {
        const { completedStages } = state;

        completedStages.pop();

        state.completedStages = [
            ...completedStages
        ];
    },
    redirectWait(state, val) {
        state.redirectWait = val === true;
    },
    success(state) {
        state.completedStages = [
            ...state.completedStages,
            STEP_THREE
        ];
    }
};

export default {
  state,
  getters,
  actions,
  mutations
};