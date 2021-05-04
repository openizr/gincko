/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import userActions from 'scripts/core/userActions';

describe('core/userActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ADD mutation', () => {
    expect(userActions.mutations.ADD({
      state: {},
      mutate: jest.fn(),
      hash: 'steps',
    }, {
      test: true,
    })).toEqual({
      test: true,
    });
  });
});
