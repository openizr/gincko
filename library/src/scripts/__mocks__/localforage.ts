/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * localforage mock.
 */
export default {
  getItem: jest.fn(() => {
    if (process.env.CACHE_EXISTING_FORM === 'true') {
      return Promise.resolve({
        values: { test: 'value' },
        variables: { var1: 'test1', var2: 'test2' },
        steps: [{
          fields: [
            {
              id: 'last',
              label: undefined,
              message: null,
              options: {},
              status: 'initial',
              type: 'Test',
              value: undefined,
            },
          ],
          id: 'test',
          status: 'initial',
        }],
      });
    }
    return Promise.resolve(null);
  }),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
};
