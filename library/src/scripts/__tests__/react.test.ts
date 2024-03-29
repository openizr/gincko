/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as react from 'scripts/react';

describe('react', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('has correct exports', () => {
    expect(Object.keys(react)).toEqual([
      'default',
      'Field',
      'Engine',
    ]);
  });
});
