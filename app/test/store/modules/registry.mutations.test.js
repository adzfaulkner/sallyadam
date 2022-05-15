import { assert, test } from 'vitest';

import { mutations } from '../../../src/store/modules/registry';

test('addContribution mutation test without payfee', () => {
    const state = {
        contributions: {},
        contributionTotal: 0,
        extra: 0,
        contributionsUuids: [],
        payFee: false,
    };

    let input = {
        uuid: 'uuid1',
        amount: {
            intValue: 100,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.contributions.uuid1, 100);
    assert.equal(state.contributionTotal, 100);
    assert.equal(state.extra, 0);
    assert.deepEqual(state.contributionsUuids, ['uuid1']);

    input = {
        uuid: 'uuid1',
        amount: {
            intValue: 200,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.contributions.uuid1, 200);
    assert.equal(state.contributionTotal, 200);
    assert.equal(state.extra, 0);
    assert.deepEqual(state.contributionsUuids, ['uuid1']);

    input = {
        uuid: 'uuid2',
        amount: {
            intValue: 300,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.contributions.uuid1, 200);
    assert.equal(state.contributions.uuid2, 300);
    assert.equal(state.contributionTotal, 500);
    assert.equal(state.extra, 0);
    assert.deepEqual(state.contributionsUuids, ['uuid1', 'uuid2']);
});

test('addContribution mutation test with payfee', () => {
    const state = {
        contributions: {},
        contributionTotal: 0,
        extra: 0,
        contributionsUuids: [],
        payFee: true,
    };

    let input = {
        uuid: 'uuid1',
        amount: {
            intValue: 100,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.contributions.uuid1, 100);
    assert.equal(state.contributionTotal, 100);
    assert.equal(state.extra, 21.4);
    assert.deepEqual(state.contributionsUuids, ['uuid1']);

    input = {
        uuid: 'uuid1',
        amount: {
            intValue: 200,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.contributions.uuid1, 200);
    assert.equal(state.contributionTotal, 200);
    assert.equal(state.extra, 22.8);
    assert.deepEqual(state.contributionsUuids, ['uuid1']);

    input = {
        uuid: 'uuid2',
        amount: {
            intValue: 300,
        },
    };

    mutations.addContribution(state, input);

    assert.equal(state.contributions.uuid1, 200);
    assert.equal(state.contributions.uuid2, 300);
    assert.equal(state.contributionTotal, 500);
    assert.equal(state.extra, 27);
    assert.deepEqual(state.contributionsUuids, ['uuid1', 'uuid2']);
});

test('nextStep mutation test', () => {
    const state = {
        contributionTotal: 0,
        completedStages: [],
    };

    mutations.nextStep(state);

    assert.deepEqual(state.completedStages, []);

    state.contributionTotal = 1;

    mutations.nextStep(state);

    assert.deepEqual(state.completedStages, ['step_one']);

    mutations.nextStep(state);

    assert.deepEqual(state.completedStages, ['step_one', 'step_two']);
});

test('payFee mutation test', () => {
    const state = {
        payFee: false,
        extra: 0,
        contributionTotal: 0,
    };

    mutations.payFee(state, false);

    assert.isFalse(state.payFee);
    assert.equal(state.extra, 0);

    state.contributionTotal = 100;

    mutations.payFee(state, true);

    assert.isTrue(state.payFee);
    assert.equal(state.extra, 21.4);

    mutations.payFee(state, false);

    assert.isFalse(state.payFee);
    assert.equal(state.extra, 0);
});

test('lastStep mutation test', () => {
    const state = {
        completedStages: []
    };

    mutations.lastStep(state);

    assert.deepEqual(state.completedStages, []);

    state.completedStages = [1];

    mutations.lastStep(state);

    assert.deepEqual(state.completedStages, []);

    state.completedStages = [1, 2];

    mutations.lastStep(state);

    assert.deepEqual(state.completedStages, [1]);
});
