import axios from 'axios';

const state = {
    user: {
        firstname: null,
        surname: null,
    },
    loginError: null,
};

export const getters = {
    isAuthenticated: (state) => state.user.firstname !== null && state.user.surname !== null,
    StateUser: (state) => state.user,
    LoginError: (state) => state.loginError,
};

export const actions = {
    async LogIn({commit, dispatch, state}, input) {
        const { username, password } = input;
        const json = JSON.stringify({ username, password });
        try {
            const response = await axios.post("/login", json, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const {user} = response.data;
            state.loginError = null;
            commit("setUser", user);
        } catch(e) {
            dispatch("LoginError", "Username or Password is incorrect. Please try again.");
        }
    },
    async Verify({ dispatch, state }) {
        if (state.user.firstname === null && state.user.surname === null) {
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
    setUser(state, user) {
        state.user = user;
    },
    logout(state, user) {
        state.user = user;
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