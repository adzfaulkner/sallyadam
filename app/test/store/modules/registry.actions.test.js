import { vi, assert, describe, it } from 'vitest';
import { actions } from '../../../src/store/modules/registry';
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

describe('Checkout action tests', () => {
    it('Dispatch / commit should not be fired',  async () => {
        const state = {
            completedStages: [],
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
                contributions: {},
                completedStages: ['step_two'],
                contributionsUuids: [],
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
            contributions: {},
            completedStages: ['step_two'],
            contributionsUuids: [],
        }, dispatch, commit });

        assert.deepEqual(actionsDispatched, ['LastStep']);
        assert.equal(window.location, "http://test");
        assert.deepEqual(committed, [{
            redirectWait: true
        }, {
            redirectWait: false
        }]);
    });
});