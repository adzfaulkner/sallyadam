import { assert, test } from 'vitest';
import currency from "currency.js";

import {
    COMPONENT_CONFIRMATION,
    COMPONENT_LIST, COMPONENT_REDIRECT_WAIT,
    COMPONENT_SUCCESS,
    getters, STEP_ONE,
} from '../../../src/store/modules/registry';

test('Getter StepOne test', () => {
    const state = {
        stepOne: {
            items: [{
                contribution: null,
            }, {
                contribution: 1,
            }],
        },
    };

    const res = getters.StepOne(state);

    assert.deepEqual(res,{
        items: [
            { contribution: null },
            { contribution: currency(1, { fromCents: true, symbol: "£" })}
        ]
    });
});

test('Getter StepTwo test', () => {
    const state = {
        stepTwo: {
            items: [{
                contribution: 1,
            },{
                contribution: 2,
            }],
        },
    };

    const res = getters.StepTwo(state);

    assert.deepEqual(res,{
        items: [
            { contribution: currency(1, { fromCents: true, symbol: "£" }) },
            { contribution: currency(2, { fromCents: true, symbol: "£" }) },
        ]
    });
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
        redirectWait: true,
    });
    assert.equal(res, COMPONENT_REDIRECT_WAIT);

    res = getters.RenderComponent({
        redirectWait: false,
        stepThree: true,
    });
    assert.equal(res, COMPONENT_SUCCESS);

    res = getters.RenderComponent({
        redirectWait: false,
        stepThree: false,
        lastStep: STEP_ONE,
    });
    assert.equal(res, COMPONENT_CONFIRMATION);

    res = getters.RenderComponent({
        redirectWait: false,
        stepThree: false,
        lastStep: null,
    });
    assert.equal(res, COMPONENT_LIST);
});