/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as plugins from 'scripts/plugins';

describe('plugins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('has correct exports', () => {
    expect(Object.keys(plugins)).toEqual([
      'loaderDisplayer',
      'reCaptchaHandler',
      'errorStepDisplayer',
    ]);
  });
});
