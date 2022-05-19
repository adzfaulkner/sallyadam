import axios from 'axios';

const state = {
    userLoggedIn: false,
    loginError: null,
};

export const getters = {
    isAuthenticated: (state) => state.userLoggedIn,
    LoginError: (state) => state.loginError,
};

export const actions = {
    async LogIn({commit, dispatch, state}, input) {
        const { password } = input;
        const json = JSON.stringify({ password });
        try {
            await axios.post("/login", json, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            state.loginError = null;
            commit("login");
        } catch(e) {
            dispatch("LoginError", "Username or Password is incorrect. Please try again.");
        }
    },
    async Verify({ dispatch, state }) {
        if (!state.userLoggedIn) {
            return;
        }

        try {
            await axios.post("/verify", {}, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (e) {
            dispatch("LogOut");
            dispatch("LoginError", "Session expired. Please log back in.");
        }
    },
    async LogOut({ commit }) {
        commit("logout", {
            firstname: null,
            surname: null,
        });
    },
    async LoginError({ commit }, error) {
        commit("error", error);
    }
};

const mutations = {
    login(state) {
        state.userLoggedIn = true;
    },
    logout(state) {
        state.userLoggedIn = false;
    },
    error(state, error) {
        state.loginError = error;
    }
};

export default {
  state,
  getters,
  actions,
  mutations
};