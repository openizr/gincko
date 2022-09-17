/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export default {
  set: vi.fn(() => Promise.resolve()),
  delete: vi.fn(() => Promise.resolve()),
  get: vi.fn(() => {
    if (process.env.CACHE_EXISTS === 'true') {
      return Promise.resolve({
        userInputs: { test: 'value' },
        fieldValues: { test: 'value' },
        variables: { var1: 'test1', var2: 'test2' },
        steps: [{
          fields: [{
            id: 'last',
            label: undefined,
            options: {},
            status: 'success',
            type: 'Message',
            value: undefined,
          }],
          id: 'root',
          status: 'success',
        }, {
          fields: [{
            id: 'last',
            label: undefined,
            options: {},
            status: 'success',
            type: 'Message',
            value: undefined,
          }],
          id: 'second',
          status: 'initial',
        }],
      });
    }
    if (process.env.CACHE_EXISTS_2 === 'true') {
      return Promise.resolve({
        userInputs: {},
        fieldValues: {},
        variables: {},
        steps: [{
          id: 'root',
          status: 'initial',
          fields: [null, null, null, null, null, null],
        }],
      });
    }
    return Promise.resolve(null);
  }),
};
