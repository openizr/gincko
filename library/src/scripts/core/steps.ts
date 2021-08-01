/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Module } from 'diox';
import { deepMerge } from 'basx';
import { Step } from 'scripts/propTypes/step';

export interface State {
  steps: Step[];
  loadingNextStep: boolean;
}

/**
 * Handles steps lifecycle in form.
 */
export default <Module<State>>{
  state: {
    steps: [],
    loadingNextStep: true,
  },
  mutations: {
    SET({ state }, mutation) {
      return deepMerge(state, { steps: mutation.steps });
    },
    SET_LOADER({ state }, mutation) {
      return deepMerge(state, {
        loadingNextStep: mutation.loadingNextStep,
      });
    },
  },
};
