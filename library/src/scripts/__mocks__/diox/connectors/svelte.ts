/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { readable } from 'svelte/store/index';

/**
 * diox/connectors/svelte mock.
 */
export default function useStore(): jest.Mock {
  const state = {
    steps: [{ id: 'start' }, { id: 'end' }],
    loading: process.env.LOADING === 'true',
  };
  return jest.fn(() => readable(state, (set) => {
    set(state);
  }));
}
