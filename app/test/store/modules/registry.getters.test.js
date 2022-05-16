import { assert, test } from 'vitest';

import {
    COMPONENT_CONFIRMATION,
    COMPONENT_LIST, COMPONENT_REDIRECT_WAIT,
    COMPONENT_SUCCESS,
    getters,
    STEP_THREE
} from '../../../src/store/modules/registry';

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


test('Getter RenderComponent test', () => {
    let res = getters.RenderComponent({
        completedStages: [],
        redirectWait: false,
    });
    assert.equal(res, COMPONENT_LIST);

    res = getters.RenderComponent({
        completedStages: [1],
        redirectWait: false,
    });
    assert.equal(res, COMPONENT_CONFIRMATION);

    res = getters.RenderComponent({
        completedStages: [STEP_THREE],
        redirectWait: false,
    });
    assert.equal(res, COMPONENT_SUCCESS);

    res = getters.RenderComponent({
        completedStages: [1,2],
        redirectWait: true,
    });
    assert.equal(res, COMPONENT_REDIRECT_WAIT);
});