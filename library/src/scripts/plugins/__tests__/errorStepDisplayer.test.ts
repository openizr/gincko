/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import BaseEngine from 'scripts/core/Engine';
import Engine from 'scripts/core/__mocks__/Engine';
import { errorStepDisplayer } from 'scripts/plugins';

describe('plugins/errorStepDisplayer', () => {
  let engine: Engine;
  const setActiveStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new Engine();
    errorStepDisplayer({ stepId: 'error', setActiveStep })(engine as unknown as BaseEngine);
  });

  test('correctly generates error step', async () => {
    await engine.trigger('error', new Error());
    expect(setActiveStep).toHaveBeenCalledWith('error');
    expect(engine.createStep).toHaveBeenCalledWith('error');
  });
});
