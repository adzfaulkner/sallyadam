import currency from "currency.js";
import axios from 'axios';

const STEP_ONE = 'step_one';
const STEP_TWO = 'step_two';
const FEE_PER = 0.014; // 1.4%
const FEE_PENCE = 20; // 20p

const state = {
    contributions: {},
    contributionTotal: 0,
    contributionsUuids: [],
    completedStages: [], 
    extra: 0,
    payFee: false,
    message: null,
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
        contributions[key] = currency(contribs[key], { fromCents: true, symbol: '£' });
    });

    return contributions;
}

export const getters = {
    Contributions: (state) => { 
        return ContributionsToCurrency(state.contributions);
    },
    HasContributions: (state) => state.contributionTotal > 0,
    ContributionTotal: (state) => {
        return currency(state.contributionTotal + state.extra, { fromCents: true, symbol: '£' });
    },
    OnStepOne: (state) => state.completedStages.length === 0,
    OnStepTwo: (state) => state.completedStages.length === 1,
    OnStepThree: (state) => state.completedStages.length === 2,
    Message: (state) => state.message,
    PayFee: (state) => state.payFee,
};

export const actions = {
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
    async LastStep({commit}) {
        await commit("lastStep");
    },
    async Checkout({state, dispatch}) {
        const { completedStages } = state;

        if (
            completedStages.length === 0 
            || completedStages[completedStages.length-1] !== STEP_TWO
        ) {
            return;
        }

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
        const extra = currency(state.extra, { fromCents: true, symbol: '£' });
        const payload = {
            items,
            currency: "GBP",
            message: state.message,
            extra: extra.intValue
        };

        try {
            const response = await axios.post("/checkout", JSON.stringify(payload), {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            dispatch("LastStep");

            const {url} = response.data;
            window.location = url;
        } catch (e) {
            if (e.response.status === 403) {
                dispatch("LogOut");
                dispatch("LoginError", "Session expired. Please log back in.");
                dispatch("LastStep");
                return;
            }

            throw e
        }
    },
};

export const mutations = {
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
    lastStep(state) {
        const { completedStages } = state;

        completedStages.pop();

        state.completedStages = [
            ...completedStages
        ];
    },
};

export default {
  state,
  getters,
  actions,
  mutations
};