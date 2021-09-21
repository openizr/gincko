/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
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

  test('UPDATE mutation', () => {
    expect(state.mutations.UPDATE({
      state: {
        steps: [],
        values: {},
        variables: {},
        loadingNextStep: true,
      },
      mutate: jest.fn(),
      hash: 'steps',
    }, {
      steps: [1],
      values: { test: 'test' },
      variables: { var1: 'test1' },
    })).toEqual({
      steps: [1],
      values: { test: 'test' },
      variables: { var1: 'test1' },
      loadingNextStep: true,
    });
  });

  test('SET_LOADER mutation', () => {
    expect(state.mutations.SET_LOADER({
      state: {
        steps: [],
        values: {},
        variables: {},
        loadingNextStep: true,
      },
      mutate: jest.fn(),
      hash: 'steps',
    }, {
      loadingNextStep: false,
    })).toEqual({
      steps: [],
      values: {},
      variables: {},
      loadingNextStep: false,
    });
  });
});
