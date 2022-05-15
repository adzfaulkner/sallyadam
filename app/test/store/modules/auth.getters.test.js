import { vi, assert, describe, it, test } from 'vitest';
import { getters } from '../../../src/store/modules/auth';

test('IsAuthenticated test', () => {
    let user = {
        firstname: null,
        surname: null,
    };

    let res = getters.isAuthenticated({
        user
    });

    assert.isFalse(res);

    user = {
        firstname: "joe",
        surname: "bloggs",
    };

    res = getters.isAuthenticated({
        user
    });

    assert.isTrue(res);
});
