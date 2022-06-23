import { assert, test, describe, it } from 'vitest';
import {mutations, STEP_ONE, STEP_TWO} from '../../../src/store/modules/registry';

test('addContribution mutation test', () => {
    const state = {
        stepOne: {
            items: [
                { contribution: null },
                { contribution: null },
            ],
            itemsMap: {
                uuid1: 0,
                uuid2: 1,
            },
        },
    };

    let input = {
        uuid: 'uuid1',
        amount: {
            intValue: 100,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.stepOne.items[0].contribution, 100);

    input = {
        uuid: 'uuid1',
        amount: {
            intValue: 200,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.stepOne.items[0].contribution, 200);

    input = {
        uuid: 'uuid2',
        amount: {
            intValue: 300,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.stepOne.items[0].contribution, 200);
    assert.equal(state.stepOne.items[1].contribution, 300);
});

test('nextStep mutation test', () => {
    const initialState = {
        stepOne: {
            items: [],
        },
        stepTwo: {
            items: [],
            payFee: false,
            payFeeAutoApplied: false,
        },
        contributionTotal: 0,
        lastStep: null,
    };

    const state = {
        ...initialState
    };

    mutations.nextStep(state);

    assert.deepEqual(initialState, state);

    state.contributionTotal = 1;
    state.lastStep = STEP_ONE;

    mutations.nextStep(state);

    assert.deepEqual({
        ...initialState,
        contributionTotal: 1,
        lastStep: STEP_TWO,
    }, state);

    state.lastStep = null;
    state.stepOne.items = [
        ...state.stepOne.items,
        {
            contribution: null,
        },
        {
            contribution: 0,
        },
        {
            contribution: 1,
        },
    ];

    mutations.nextStep(state);

    assert.deepEqual({
        ...initialState,
        contributionTotal: 1,
        lastStep: STEP_ONE,
        stepOne: state.stepOne,
        stepTwo: {
            items: [{
                contribution: 1,
            }],
            payFee: true,
            payFeeAutoApplied: true,
        },
    }, state);
});

test('payFee mutation test', () => {
    const state = {
        stepTwo: { payFee: false },
    };

    mutations.payFee(state, false);

    assert.isFalse(state.stepTwo.payFee);

    mutations.payFee(state, true);

    assert.isTrue(state.stepTwo.payFee);
});

test('lastStep mutation test', () => {
    const state = {
        lastStep: null
    };

    mutations.lastStep(state);

    assert.isNull(state.lastStep);

    state.lastStep = STEP_ONE;

    mutations.lastStep(state);

    assert.isNull(state.lastStep);

    state.lastStep = STEP_TWO;

    mutations.lastStep(state);

    assert.equal(state.lastStep, STEP_ONE);
});

describe('init mutation',  () => {
    it('should init', function () {
        const state = {
            stepOne: {
                items: [],
                itemsMap: {},
                contributions: {},
            },
        };

        mutations.init(state,{
            registryItems: []
        });

        assert.deepEqual(state.stepOne.items, []);
        assert.deepEqual(state.stepOne.itemsMap, {});
    });

    it('should init with contribution vals', function () {
        const state = {
            stepOne: {
                items: [],
                itemsMap: {},
                contributions: {
                    2: 100,
                },
            },
        };

        mutations.init(state,{
            registryItems: [{
                uuid: 1
            },{
                uuid: 2
            }]
        });

        assert.deepEqual(state.stepOne.items, [{
            uuid: 1,
            contribution: null,
        },{
            uuid: 2,
            contribution: 100,
        }]);

        assert.deepEqual(state.stepOne.itemsMap, {
            1: "0",
            2: "1",
        });
    });
});

describe('updateContributionTotal mutation',  () => {
    const sums = [
        [0, false, 0, 0],
        [0, true, 0, 0],
        [100, false, 100, 0],
        [100, true, 100, 21.4],
        [500, false, 500, 0],
        [500, true, 500, 27],
        [1000, false, 1000, 0],
        [1000, true, 1000, 34],
        [1500, false, 1500, 0],
        [1500, true, 1500, 41],
        [2000, false, 2000, 0],
        [2000, true, 2000, 48],
        [2500, false, 2500, 0],
        [2500, true, 2500, 55],
        [3000, false, 3000, 0],
        [3000, true, 3000, 62],
    ];

    it.each(sums)('should update contribution total', function (
        contribution, payFee,expTotal, expExtra
    ) {
        const state = {
            stepOne: {
                items: [{contribution}],
            },
            stepTwo: {
                payFee,
            },
            contributionTotal: 0,
            extra: 0,
        };

        mutations.updateContributionTotal(state);

        assert.equal(state.contributionTotal, expTotal);
        assert.equal(state.extra, expExtra);
    });
});

test('pay fee auto applied', () => {
    const state = {
        stepOne: {
            items: [],
        },
        stepTwo: {
            items: [],
            payFee: false,
            payFeeAutoApplied: false,
        },
        lastStep: null,
        contributionTotal: 1,
    };

    mutations.nextStep(state);

    assert.isTrue(state.stepTwo.payFee);
    assert.isTrue(state.stepTwo.payFeeAutoApplied);

    state.stepTwo = {
        ...state.stepTwo,
        payFee: false,
    };

    mutations.nextStep(state);

    assert.isFalse(state.stepTwo.payFee);
    assert.isTrue(state.stepTwo.payFeeAutoApplied);
});
