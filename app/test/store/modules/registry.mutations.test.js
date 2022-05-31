import { assert, test } from 'vitest';

import {mutations, STEP_ONE, STEP_TWO} from '../../../src/store/modules/registry';

test('addContribution mutation test without payfee', () => {
    const state = {
        contributionTotal: 0,
        extra: 0,
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
        stepTwo: {
            payFee: false,
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
    assert.equal(state.contributionTotal, 100);
    assert.equal(state.extra, 0);

    input = {
        uuid: 'uuid1',
        amount: {
            intValue: 200,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.stepOne.items[0].contribution, 200);
    assert.equal(state.contributionTotal, 200);
    assert.equal(state.extra, 0);

    input = {
        uuid: 'uuid2',
        amount: {
            intValue: 300,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.stepOne.items[0].contribution, 200);
    assert.equal(state.stepOne.items[1].contribution, 300);
    assert.equal(state.contributionTotal, 500);
    assert.equal(state.extra, 0);
});

test('addContribution mutation test with payfee', () => {
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
        stepTwo: {
            payFee: true,
        },
        contributionTotal: 0,
        extra: 0,
    };

    let input = {
        uuid: 'uuid1',
        amount: {
            intValue: 100,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.stepOne.items[0].contribution, 100);
    assert.equal(state.contributionTotal, 100);
    assert.equal(state.extra, 21.4);

    input = {
        uuid: 'uuid1',
        amount: {
            intValue: 200,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.stepOne.items[0].contribution, 200);
    assert.equal(state.contributionTotal, 200);
    assert.equal(state.extra, 22.8);

    input = {
        uuid: 'uuid2',
        amount: {
            intValue: 300,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.stepOne.items[0].contribution, 200);
    assert.equal(state.stepOne.items[1].contribution, 300);
    assert.equal(state.contributionTotal, 500);
    assert.equal(state.extra, 27);
});

test('nextStep mutation test', () => {
    const initialState = {
        stepOne: {
            items: [],
        },
        stepTwo: {
            items: [],
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
            }]
        },
    }, state);
});

test('payFee mutation test', () => {
    const state = {
        stepTwo: { payFee: false },
        extra: 0,
        contributionTotal: 0,
    };

    mutations.payFee(state, false);

    assert.isFalse(state.stepTwo.payFee);
    assert.equal(state.extra, 0);

    state.contributionTotal = 100;

    mutations.payFee(state, true);

    assert.isTrue(state.stepTwo.payFee);
    assert.equal(state.extra, 21.4);

    mutations.payFee(state, false);

    assert.isFalse(state.stepTwo.payFee);
    assert.equal(state.extra, 0);
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
