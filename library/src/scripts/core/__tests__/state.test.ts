/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import state from 'scripts/core/state';

describe('core/state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('UPDATE', () => {
    expect(state.mutations.UPDATE({
      state: {
        steps: [],
        userInputs: {},
        variables: {},
        loading: true,
      },
      mutate: jest.fn(),
      hash: 'state',
    }, {
      steps: [1],
      userInputs: { test: 'test' },
      variables: { var1: 'test1' },
      loading: false,
    })).toEqual({
      steps: [1],
      userInputs: { test: 'test' },
      variables: { var1: 'test1' },
      loading: false,
    });
  });

  test('SET_LOADER', () => {
    expect(state.mutations.SET_LOADER({
      state: {
        steps: [],
        userInputs: {},
        variables: {},
        loading: true,
      },
      mutate: jest.fn(),
      hash: 'state',
    }, false)).toEqual({
      steps: [],
      userInputs: {},
      variables: {},
      loading: false,
    });
  });
});
