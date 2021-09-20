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
import { AnyValues } from 'scripts/core/Engine';

export interface State {
  steps: Step[];
  values: AnyValues;
  variables: AnyValues;
  loadingNextStep: boolean;
}

/**
 * Handles state lifecycle in form.
 */
export default <Module<State>>{
  state: {
    steps: [],
    values: {},
    variables: {},
    loadingNextStep: true,
  },
  mutations: {
    UPDATE({ state }, mutation) {
      return deepMerge(state, {
        steps: mutation.steps,
        values: mutation.values,
        variables: mutation.variables,
      });
    },
    SET_LOADER({ state }, mutation) {
      return deepMerge(state, {
        loadingNextStep: mutation.loadingNextStep,
      });
    },
  },
};
