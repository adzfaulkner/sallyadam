import { createStore } from 'vuex';
import createPersistedState from "vuex-persistedstate";
import auth from './modules/auth';
import registry from './modules/registry';

export const store = createStore({
  modules: {
    auth,
    registry,
  },
  plugins: [createPersistedState({
    paths: [
        "auth.userLoggedIn",
        "registry.stepOne.contributions",
        "registry.stepTwo.email",
        "registry.stepTwo.payFee",
        "registry.stepTwo.message",
    ]
  })]
});
