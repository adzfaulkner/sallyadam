import { vi, assert, describe, it } from 'vitest';
import {actions, STEP_ONE, STEP_TWO} from '../../../src/store/modules/registry';
import fs from "fs";
import axios from 'axios';

vi.mock('axios', () => {
    return {
        default: {
            post: vi.fn()
                .mockRejectedValueOnce({ response: { status: 403 } })
                .mockResolvedValueOnce({ data: { url: "http://test" } })
        },
    }
});

let validEmails;

try {
    validEmails = String(fs.readFileSync('./test/store/modules/valid_emails.txt'))
        .split("\n");
} catch (e) {
    validEmails = [
        'test@example.com',
        'test@example.co',
        'test.test@example.com',
        'test-test@example.com',
        'test_test@example.com',
    ];
}

const invalidEmails = [
    ["", "Please enter your email"],
    ["example.com", "Please enter a valid email"],
    ["test@", "Please enter a valid email"],
    ["test@.com", "Please enter a valid email"],
    ["test@.com", "Please enter a valid email"],
];

describe('Add email address',  () => {
    it.each(validEmails)('Valid emails should commit the entered email and commit error message of none',  async (email) => {
        const commits = [];
        const commit = (mutation, val) => {
            commits.push({
                mutation,
                val,
            });
        };

        const state = {
            lastStep: STEP_ONE,
            stepTwo: {
                email
            },
        };

        await actions.EmailAdded({ commit, state }, email);

        assert.deepEqual(commits, [{
            mutation: "emailAdded",
            val: email,
        },{
            mutation: "regError",
            val: {
                field: 'email',
                error: null,
            },
        }]);
    });

    it.each(invalidEmails)('Invalid emails should commit the entered email and commit an error message',  async (email, error) => {
        const commits = [];
        const commit = (mutation, val) => {
            commits.push({
                mutation,
                val,
            });
        };

        const state = {
            lastStep: STEP_ONE,
            stepTwo: {
                email
            },
        };

        await actions.EmailAdded({ commit, state }, email);

        assert.deepEqual(commits, [{
            mutation: "emailAdded",
            val: String(email),
        },{
            mutation: "regError",
            val: {
                field: 'email',
                error,
            },
        }], 'Email is: ' + email);
    });
});

describe('Next Step',  () => {
    const passThru = [
        [{
            stepOne: {},
            lastStep: null,
        }],
        [{
            stepTwo: {
                email: "test@example.com"
            },
            lastStep: STEP_ONE,
        }],
    ];

    it.each(passThru)('Valid stats that will pass thru dispatch checkout',  async (state) => {
        const commits = [];
        const commit = (mutation, val) => {
            commits.push({
                mutation,
                val,
            });
        };

        const dispatched = [];
        const dispatch = (action) => {
            dispatched.push(action);
        };

        await actions.NextStep({ state, dispatch, commit });

        assert.deepEqual(commits, [
            {
                mutation: "errors",
                val: {},
            },
            {
                mutation: "nextStep",
                val: undefined,
            },
            {
                mutation: "updateContributionTotal",
                val: undefined,
            }
        ]);

        assert.deepEqual(dispatched, ['Checkout']);
    });

    it('Step two only validates email and if error will not pass thru',  async () => {
        const state = {
            stepTwo: {
                email: ""
            },
            lastStep: STEP_ONE,
        };

        const commits = [];
        const commit = (mutation, val) => {
            commits.push({
                mutation,
                val,
            });
        };

        const dispatched = [];
        const dispatch = (action) => {
            dispatched.push(action);
        };

        await actions.NextStep({ state, dispatch, commit });

        assert.deepEqual(commits, [
            {
                mutation: "errors",
                val: {
                    email: "Please enter your email",
                },
            }
        ]);

        assert.lengthOf(dispatched, 0);
    });
});

describe('Checkout action tests', () => {
    it('Dispatch / commit should not be fired',  async () => {
        const state = {
            lastStep: null,
        };

        let dispatchCalled = false;
        const dispatch = () => {
            dispatchCalled = true;
        };

        let commitCalled = false;
        const commit = () => {
            commitCalled = true;
        };

        await actions.Checkout({ state, dispatch, commit });

        assert.isFalse(dispatchCalled);
        assert.isFalse(commitCalled);
    });

    it('Dispatch should not be fired',  async () => {
        let dispatchCalled = false;
        const dispatch = () => {
            dispatchCalled = true;
        };

        let commitCalled = false;
        const commit = () => {
            commitCalled = true;
        };

        await actions.Checkout({ state: {
            completedStages: [],
        }, dispatch });

        await actions.Checkout({ state: {
                completedStages: [1],
            }, dispatch, commit });

        assert.isFalse(dispatchCalled);
        assert.isFalse(commitCalled);
    });

    it('If user is not logged in then they should be auto logged out',  async () => {
        const actionsDispatched = [];
        const dispatch = function (action) {
            actionsDispatched.push(action);
        };

        const committed = [];
        const commit = function (action, val) {
            committed.push({
                [action]: val,
            });
        };

        await actions.Checkout({ state: {
                stepTwo: {
                    items: [],
                },
                lastStep: STEP_TWO,
        }, dispatch, commit });

        assert.deepEqual(actionsDispatched, ['LogOut', 'LoginError', 'LastStep']);
        assert.deepEqual(committed, [{
            redirectWait: true
        }, {
            redirectWait: false
        }]);
    });

    it('User has successfully checked out',  async () => {
        global.window = Object.create(window);

        const actionsDispatched = [];
        const dispatch = function (action) {
            actionsDispatched.push(action);
        };

        const committed = [];
        const commit = function (action, val) {
            committed.push({
                [action]: val,
            });
        };

        await actions.Checkout({ state: {
            stepTwo: {
                items: [],
            },
            lastStep: STEP_TWO,
        }, dispatch, commit });

        assert.deepEqual(actionsDispatched, ['LastStep']);
        assert.equal(window.location, "http://test");
        assert.deepEqual(committed, [{
            redirectWait: true
        }]);
    });
});