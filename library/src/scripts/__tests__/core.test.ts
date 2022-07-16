/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import core from 'scripts/core';
import BaseEngine from 'scripts/core/Engine';

describe('core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('has correct exports', () => {
    expect(core).toBe(BaseEngine);
  });
});
