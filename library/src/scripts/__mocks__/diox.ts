/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * diox mock.
 */
const store = {
  register: jest.fn(),
  mutate: jest.fn(),
  subscribe: jest.fn(),
};

export default jest.fn(() => store);
