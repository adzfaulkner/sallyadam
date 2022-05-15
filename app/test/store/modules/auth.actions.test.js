import { vi, assert, describe, it } from 'vitest';
import { actions } from '../../../src/store/modules/auth';
import axios from 'axios';

vi.mock('axios', () => {
    return {
        default: {
            post: vi.fn()
                .mockRejectedValueOnce({ response: { status: 404 } })
                .mockResolvedValueOnce({ data: { user: {
                    firstname: "Testy",
                    surname: "Test",
                } } })
                .mockRejectedValueOnce({ response: { status: 404 } })
                .mockResolvedValueOnce({ data: { message: "OK" } })
        },
    }
});

describe('Login action tests', () => {
    it('Unsuccessful login should fire a message', async () => {
        let res = {
            action: "",
            msg: "",
        };
        const dispatch = (action, msg) => {
            res = {
                action,
                msg,
            }
        };

        await actions.LogIn({
            commit: () => {},
            dispatch
        }, {
            username: "user",
            password: "pwd"
        });

        assert.deepEqual(res, {
            action: "LoginError",
            msg: "Username or Password is incorrect. Please try again.",
        });
    });

    it('Success login should commit the user', async () => {
        let res = {};

        const commit = (mutation, data) => {
            res = {
                mutation,
                data,
            };
        };

        const state = {};

        await actions.LogIn({
            commit,
            dispatch: () => {},
            state
        }, {
            username: "user",
            password: "pwd"
        });

        assert.deepEqual(state, {
            loginError: null,
        });

        assert.deepEqual(res, {
            mutation: "setUser",
            data: {
                firstname: "Testy",
                surname: "Test",
            },
        });
    });
});

describe('Verify action tests', () => {
    it('Should not dispatch if user is not logged in', async () => {
        let dispatched = false;
        const dispatch = () => {
            dispatched = true;
        };

        await actions.Verify({
            dispatch,
            state: {
                user: {
                    firstname: null,
                    surname: null,
                },
            }
        });

        assert.isFalse(dispatched);
    });

    it('Should log user out if unverified', async () => {
        let res = [];
        const dispatch = (...args) => {
            res = [
                ...res,
                ...args,
            ];
        };

        await actions.Verify({
            dispatch,
            state: {
                user: {
                    firstname: 'joe',
                    surname: 'bloggs',
                },
            }
        });

        assert.deepEqual(res, [
            "LogOut",
            "LoginError",
            "Session expired. Please log back in."
        ]);
    });

    it('Should not dispatch if user is verified', async () => {
        let dispatched = false;
        const dispatch = () => {
            dispatched = true;
        };

        await actions.Verify({
            dispatch,
            state: {
                user: {
                    firstname: "joe",
                    surname: "bloggs",
                },
            }
        });

        assert.isFalse(dispatched);
    });
});