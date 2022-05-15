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
    it('Dispatch should not be fired',  async () => {
        const state = {
            completedStages: [],
        };

        let dispatchCalled = false;
        const dispatch = () => {
            dispatchCalled = true;
        };

        await actions.Checkout({ state, dispatch });

        assert.isFalse(dispatchCalled);
    });

    it('Dispatch should not be fired',  async () => {
        let dispatchCalled = false;
        const dispatch = () => {
            dispatchCalled = true;
        };

        await actions.Checkout({ state: {
            completedStages: [],
        }, dispatch });

        await actions.Checkout({ state: {
                completedStages: [1],
            }, dispatch });

        assert.isFalse(dispatchCalled);
    });

    it('If user is not logged in then they should be auto logged out',  async () => {
        const actionsDispatched = [];
        const dispatch = function (action) {
            actionsDispatched.push(action);
        };

        await actions.Checkout({ state: {
                contributions: {},
                completedStages: ['step_two'],
                contributionsUuids: [],
            }, dispatch });

        assert.deepEqual(actionsDispatched, ['LogOut', 'LoginError', 'LastStep']);
    });

    it('User has successfully checked out',  async () => {
        global.window = Object.create(window);

        const actionsDispatched = [];
        const dispatch = function (action) {
            actionsDispatched.push(action);
        };

        await actions.Checkout({ state: {
            contributions: {},
            completedStages: ['step_two'],
            contributionsUuids: [],
        }, dispatch });

        assert.deepEqual(actionsDispatched, ['LastStep']);
        assert.equal(window.location, "http://test")
    });
});