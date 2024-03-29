/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * diox mock.
 */
const store = {
  register: vi.fn(),
  mutate: vi.fn(),
  subscribe: vi.fn(),
};

export default vi.fn(() => store);
