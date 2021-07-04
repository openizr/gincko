/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Module } from 'diox';
import { UserAction } from 'scripts/core/Engine';

/**
 * Handles all user actions in form.
 */
export default {
  state: null as UserAction | null,
  mutations: {
    ADD(_api, mutation): UserAction[] {
      return mutation;
    },
  },
} as Module;
