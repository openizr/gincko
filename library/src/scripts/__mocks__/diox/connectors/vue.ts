/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * diox/connectors/vue mock.
 */
export default function useStore(): jest.Mock {
  return jest.fn(() => ({
    steps: [{ id: 'start' }, { id: 'end' }],
    loading: process.env.LOADING === 'true',
  }));
}
