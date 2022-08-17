import { assert, test, describe, it } from 'vitest';
import {mutations, STEP_ONE, STEP_TWO} from '../../../src/store/modules/registry';
import currency from "currency.js";

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
        [0, false, 0],
        [0, true, 0],
        [500, false, 0],
        [500, true, 27],
        [1000, false, 0],
        [1000, true, 34],
        [1500, false, 0],
        [1500, true, 42],
        [2000, false, 0],
        [2000, true, 49],
        [2500, false, 0],
        [2500, true, 56],
        [3000, false, 0],
        [3000, true, 63],
        [3500, false, 0],
        [3500, true, 70],
        [4000, false, 0],
        [4000, true, 77],
        [5000, false, 0],
        [5000, true, 91],
        [5500, false, 0],
        [5500, true, 98],
        [6000, false, 0],
        [6000, true, 105],
        [6500, false, 0],
        [6500, true, 113],
        [7000, false, 0],
        [7000, true, 120],
        [7500, false, 0],
        [7500, true, 127],
        [8000, false, 0],
        [8000, true, 134],
        [8500, false, 0],
        [8500, true, 141],
        [9000, false, 0],
        [9000, true, 148],
        [9500, false, 0],
        [9500, true, 155],
        [10000, false, 0],
        [10000, true, 162],
    ];

    it.each(sums)('should update contribution total', function (
        contribution, payFee, expExtra
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

        assert.equal(state.contributionTotal, contribution);
        assert.equal(currency(state.extra, { fromCents: true, symbol: "£" }).intValue, expExtra);
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
