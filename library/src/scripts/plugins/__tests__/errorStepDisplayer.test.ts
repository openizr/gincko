/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { errorStepDisplayer } from 'scripts/plugins';
import BaseEngine from 'scripts/core/__mocks__/Engine';

describe('plugins/errorStepDisplayer', () => {
  let engine: BaseEngine;
  const setActiveStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new BaseEngine();
    errorStepDisplayer({ stepId: 'error', setActiveStep })(engine as unknown as Engine);
  });

  test('correctly generates error step', async () => {
    await engine.trigger('error', new Error());
    expect(setActiveStep).toHaveBeenCalledWith('error');
    expect(engine.createStep).toHaveBeenCalledWith('error');
  });
});
