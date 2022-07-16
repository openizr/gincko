/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Module } from 'diox';
import { deepMerge } from 'basx';

export interface StateState {
  steps: Step[];
  loading: boolean;
  userInputs: UserInputs;
  variables: Variables;
}

/**
 * Handles state lifecycle in form.
 */
export default <Module<StateState>>{
  state: {
    steps: [],
    loading: true,
    variables: {},
    userInputs: {},
  },
  mutations: {
    UPDATE({ state }, mutation) {
      return deepMerge(state, {
        steps: mutation.steps,
        loading: mutation.loading,
        variables: mutation.variables,
        userInputs: mutation.userInputs,
      });
    },
    SET_LOADER({ state }, loading) {
      return deepMerge(state, { loading });
    },
  },
};
