import currency from "currency.js";
import axios from 'axios';

export const COMPONENT_SUCCESS = 'success';
export const COMPONENT_LIST = 'list';
export const COMPONENT_CONFIRMATION = 'confirmation';
export const COMPONENT_REDIRECT_WAIT = 'redirectWait';
const CURRENCY = "GBP";
const CURRENCY_SYMBOL = "£";

export const STEP_ONE = 'step_one';
export const STEP_TWO = 'step_two';
const FEE_PER = 1.4;
const FEE_PENCE = 20; // 20p

const MESSAGE_CHAR_LIMIT = 500;

const initialState = {
    lastStep: null,
    stepOne: {
        items: [],
        itemsMap: {},
        errors: {},
        contributions: {},
    },
    stepTwo: {
        items: [],
        email: null,
        payFeeAutoApplied: false,
        payFee: false,
        message: null,
        errors: {},
    },
    stepThree: false,
    contributionTotal: 0,
    extra: 0,
    redirectWait: false,
};

const state = {
    ...initialState
};

const helper = {
    CalculateExtra: (payFee, total) => {
        if (!payFee || total === 0) {
            return 0;
        }

        const incFee = (total + FEE_PENCE) / (1 - FEE_PER / 100);

        return incFee - total;
    },
    CalculateTotal: (items) => {
        let total = 0;

        for (let item of items) {
            total += item.contribution;
        }

        return total;
    },
    ContributionsToCurrency(items) {
        const contributions = [];

        for (let item of items) {
            contributions.push(
                {
                    uuid: item.uuid,
                    contribution: helper.NewCurrency(item.contribution),
                }
            );
        }

        return contributions;
    },
    NewCurrency: (val) => {
        return currency(val, { fromCents: true, symbol: CURRENCY_SYMBOL });
    },
    Validate: (state) => {
        const errors = {};

        if (state.lastStep === STEP_ONE) {
            const { email, message } = state.stepTwo;

            const emailMsg = helper.CheckEmail(email);
            const msgMsg = helper.CheckMessage(message);

            if (emailMsg !== null) {
                errors.email = emailMsg;
            }

            if (msgMsg !== null) {
                errors.message = msgMsg;
            }
        }

        return errors;
    },
    CheckMessage: (message) => {
        return String(message).length > MESSAGE_CHAR_LIMIT ? "Please keep your message to under 500 chars long" : null;
    },
    CheckEmail: (email) => {
        if (email === null || email === "") {
            return "Please enter your email";
        } else if (!helper.ValidateEmail(email)) {
            return "Please enter a valid email";
        }

        return null;
    },
    ValidateEmail: (email) => {
        const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        return re.test(email);
    }
};

export const getters = {
    StepOne: (state) => {
        const { stepOne } = state;

        const items = [
            ...stepOne.items
        ];

        for (const index in items) {
            items[index] = {
                ...items[index],
                contribution: items[index].contribution === null ? null : helper.NewCurrency(items[index].contribution)
            };
        }

        return {
            ...stepOne,
            items
        };
    },
    StepTwo: (state) => {
        const { stepTwo } = state;

        const items = [
            ...stepTwo.items,
        ];

        for (const index in items) {
            items[index] = {
                ...items[index],
                contribution: helper.NewCurrency(items[index].contribution)
            };
        }

        return {
            ...stepTwo,
            items
        };
    },
    HasContributions: (state) => state.contributionTotal > 0,
    ContributionTotal: (state) => {
        const { contributionTotal, extra } = state;

        return helper.NewCurrency(contributionTotal + extra);
    },
    RegistryErrors: ({lastStep, stepOne, stepTwo}) => {
        if(lastStep === null) {
            return {
                ...stepOne.errors
            };
        }

        if (lastStep === STEP_ONE) {
            return {
                ...stepTwo.errors
            };
        }

        return {};
    },
    HasErrors: (state) => {
        return Object.keys(getters.RegistryErrors(state)).length > 0;
    },
    RenderComponent: (state) => {
        const { lastStep, stepThree, redirectWait } = state;

        if (redirectWait) {
            return COMPONENT_REDIRECT_WAIT;
        }

        if (stepThree) {
            return COMPONENT_SUCCESS;
        }

        if (lastStep === STEP_ONE) {
            return COMPONENT_CONFIRMATION;
        }

        return COMPONENT_LIST;
    },
    MessageCharLimit: () => {
        return MESSAGE_CHAR_LIMIT;
    }
};

export const actions = {
    async InitRegistry({commit, dispatch}, {registryItems}) {
        await commit("init", { registryItems });
        await commit("updateContributionTotal");
        dispatch("NextStep");
    },
    async ResetRegistry({commit}) {
        await commit("reset");
    },
    async AddContribution({commit}, input) {
        await commit("addContribution", input);
        await commit("updateContributionTotal");
    },
    async NextStep({commit, dispatch, state}) {
        const errors = helper.Validate(state);

        await commit("errors", errors);

        if (Object.keys(errors).length === 0) {
            await commit("nextStep");
            await commit("updateContributionTotal");
            dispatch("Checkout");
        }
    },
    async PayFee({commit}, decision) {
        await commit("payFee", decision);
        await commit("updateContributionTotal");
    },
    async MessageAdded({commit}, message) {
        message = String(message);
        await commit("messageAdded", message);

        const error = helper.CheckMessage(message);
        await commit("regError", { field: 'message', error });
    },
    async EmailAdded({commit}, email) {
        email = String(email).trim();

        await commit("emailAdded", email);

        const error = helper.CheckEmail(email);

        await commit("regError", { field: 'email', error });
    },
    async LastStep({commit}) {
        await commit("lastStep");
    },
    async Checkout({state, dispatch, commit}) {
        const { lastStep, stepTwo, extra } = state;

        if (lastStep !== STEP_TWO) {
            return;
        }

        await commit('redirectWait', true);

        const contribs = helper.ContributionsToCurrency(stepTwo.items);
        const items = [];

        for (let item of contribs) {
            items.push({
                uuid: item.uuid,
                amount: item.contribution.intValue
            });
        }

        const ext = helper.NewCurrency(extra);
        const payload = {
            items,
            currency: CURRENCY,
            message: String(stepTwo.message).trim(),
            extra: ext.intValue,
            email: stepTwo.email,
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
    init(state, { registryItems }) {
        const { stepOne } = state;

        const map = {};
        let uuid;
        for (const index in registryItems) {
            uuid = registryItems[index].uuid;
            registryItems[index].contribution = uuid in stepOne.contributions ? stepOne.contributions[uuid] :  null;
            map[uuid] = index;
        }

        stepOne.items = registryItems;

        state.stepOne = {
            ...state.stepOne,
            items: registryItems,
            itemsMap: map,
        };
    },
    reset(state) {
        const { stepOne } = state;

        for (const index in stepOne.items) {
            stepOne.items[index].contribution = null;
        }

        const resetState = {
            ...initialState,
            stepOne
        };

        Object.assign(state, resetState);
    },
    addContribution(state, input) {
        const { stepOne } = state;
        const { uuid, amount } = input;

        const index = stepOne.itemsMap[uuid];
        const items = [
            ...stepOne.items
        ];
        items[index].contribution = amount.intValue;

        const contributions = {
            ...stepOne.contributions
        };

        contributions[uuid] = amount.intValue;

        state.stepOne = {
            ...stepOne,
            items,
            contributions,
        };
    },
    updateContributionTotal(state) {
        const {stepOne, stepTwo} = state;

        state.contributionTotal = helper.CalculateTotal(stepOne.items);
        state.extra = helper.CalculateExtra(stepTwo.payFee, state.contributionTotal);
    },
    nextStep(state) {
        if (!getters.HasContributions(state)) {
            return;
        }

        if (state.lastStep === STEP_ONE) {
            state.lastStep = STEP_TWO;
            return;
        }

        const { stepOne, stepTwo } = state;

        const items = [];
        for (let item of stepOne.items) {
            if(item.contribution !== null && item.contribution > 0) {
                items.push({...item});
            }
        }

        const payFee = stepTwo.payFeeAutoApplied === false ? true : stepTwo.payFee;

        state.lastStep = STEP_ONE;
        state.stepTwo = {
            ...stepTwo,
            items,
            payFee,
            payFeeAutoApplied: true,
        };
    },
    payFee(state, decision) {
        const payFee = decision === true;

        state.stepTwo = {
            ...state.stepTwo,
            payFee
        };
    },
    messageAdded(state, message) {
        state.stepTwo = {
            ...state.stepTwo,
            message,
        };
    },
    emailAdded(state, email) {
        state.stepTwo = {
            ...state.stepTwo,
            email
        };
    },
    lastStep(state) {
        if (state.lastStep === STEP_TWO) {
            state.lastStep = STEP_ONE;
            return;
        }

        state.lastStep = null;
    },
    redirectWait(state, val) {
        state.redirectWait = val === true;
    },
    success(state) {
        state.stepThree = true;
    },
    errors(state, errors) {
        const { lastStep } = state;

        if (lastStep === STEP_ONE) {
            state.stepTwo.errors = errors;
        }

        if (lastStep === null) {
            state.stepOne.errors = errors;
        }
    },
    regError(state, {field, error}) {
        const { lastStep } = state;

        if (lastStep === STEP_ONE) {
            if (error === null) {
                delete state.stepTwo.errors[field];
                return;
            }

            state.stepTwo.errors = {
                ...state.stepTwo.errors,
                [field]: error,
            };
        }

        if (lastStep === null) {
            console.log('in state', field, error, state.stepOne);

            if (error === null) {
                delete state.stepOne.errors[field];
                return;
            }

            state.stepOne.errors = {
                ...state.stepOne.errors,
                [field]: error,
            };
        }
    }
};

export default {
  state,
  getters,
  actions,
  mutations
};