/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as svelte from 'scripts/svelte';

describe('svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('has correct exports', () => {
    expect(Object.keys(svelte)).toEqual([
      'default',
      'Field',
      'Engine',
    ]);
  });
});
