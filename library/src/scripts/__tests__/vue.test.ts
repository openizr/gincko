/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as vue from 'scripts/vue';

describe('vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('has correct exports', () => {
    expect(Object.keys(vue)).toEqual([
      'default',
      'Field',
      'Engine',
    ]);
  });
});
