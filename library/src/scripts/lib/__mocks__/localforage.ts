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
  getItem: jest.fn(() => Promise.resolve((process.env.CACHE_NOT_EMPTY === 'true')
    ? '{"test": "value"}'
    : null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
};
