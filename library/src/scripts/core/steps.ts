/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Module } from 'diox';
import { deepMerge } from 'basx';

interface State {
  steps: string[];
  loadingNextStep: boolean;
}

/**
 * Handles steps lifecycle in form.
 */
export default {
  state: {
    steps: [],
    loadingNextStep: true,
  },
  mutations: {
    SET({ state }, mutation): State {
      return deepMerge(state, { steps: mutation.steps }) as State;
    },
    SET_LOADER({ state }, mutation): State {
      return deepMerge(state, {
        loadingNextStep: mutation.loadingNextStep,
      }) as State;
    },
  },
} as Module;
