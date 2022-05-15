import { assert, test } from 'vitest';

import { getters } from '../../../src/store/modules/registry';

test('Getter Contributions test', () => {
    let res = getters.Contributions({
        contributions: {},
    });
    assert.isEmpty(res);

    res = getters.Contributions({
        contributions: {
            uuid1: 100,
            uuid2: 200,
        },
    });
    assert.isObject(res, 2);
    assert.equal(res.uuid1.intValue, 100);
    assert.equal(res.uuid2.intValue, 200);
});

test('Getter HasContributions test', () => {
    let res = getters.HasContributions({
        contributionTotal: 0,
    });
    assert.isFalse(res);

    res = getters.HasContributions({
        contributionTotal: 1,
    });
    assert.isTrue(res);
});

test('Getter ContributionTotal test', () => {
    let res = getters.ContributionTotal({
        contributionTotal: 0,
        extra: 0,
    });
    assert.equal(0, res.intValue);

    res = getters.ContributionTotal({
        contributionTotal: 1,
        extra: 0,
    });
    assert.equal(1, res.intValue);

    res = getters.ContributionTotal({
        contributionTotal: 1,
        extra: 1,
    });
    assert.equal(2, res.intValue);
});


test('Getter OnStepOne test', () => {
    let res = getters.OnStepOne({
        completedStages: []
    });
    assert.isTrue(res);

    res = getters.OnStepOne({
        completedStages: [1]
    });
    assert.isFalse(res);

    res = getters.OnStepOne({
        completedStages: [1,2]
    });
    assert.isFalse(res);
});

test('Getter OnStepTwo test', () => {
    let res = getters.OnStepTwo({
        completedStages: []
    });
    assert.isFalse(res);

    res = getters.OnStepTwo({
        completedStages: [1]
    });
    assert.isTrue(res);

    res = getters.OnStepTwo({
        completedStages: [1,2]
    });
    assert.isFalse(res);
});

test('Getter OnStepThree test', () => {
    let res = getters.OnStepThree({
        completedStages: []
    });
    assert.isFalse(res);

    res = getters.OnStepThree({
        completedStages: [1]
    });
    assert.isFalse(res);

    res = getters.OnStepThree({
        completedStages: [1,2]
    });
    assert.isTrue(res);
});