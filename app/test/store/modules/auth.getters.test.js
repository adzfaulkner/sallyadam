import { assert, test } from 'vitest';
import { getters } from '../../../src/store/modules/auth';

test('IsAuthenticated test', () => {
    let res = getters.isAuthenticated({
        userLoggedIn: false,
    });

    assert.isFalse(res);

    res = getters.isAuthenticated({
        userLoggedIn: true,
    });

    assert.isTrue(res);
});
