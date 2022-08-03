/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Module } from 'diox';
import { deepCopy } from 'basx';

/**
 * Handles all user actions in form.
 */
export default <Module<UserAction | null>>{
  state: null,
  mutations: {
    ADD(_api, mutation) {
      return deepCopy(mutation);
    },
  },
};
