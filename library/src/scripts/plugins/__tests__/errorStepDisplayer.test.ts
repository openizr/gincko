/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';
import MockedEngine from 'scripts/core/__mocks__/Engine';
import errorStepDisplayer from 'scripts/plugins/errorStepDisplayer';

describe('plugins/errorStepDisplayer', () => {
  let engine = MockedEngine();

  beforeEach(() => {
    jest.clearAllMocks();
    engine = MockedEngine();
    errorStepDisplayer({ stepId: 'error', setActiveStep: () => null })(engine as unknown as Engine);
  });

  test('error hook - step id does not exist', async () => {
    jest.clearAllMocks();
    engine = MockedEngine();
    errorStepDisplayer({ stepId: 'invalid', setActiveStep: () => null })(engine as unknown as Engine);
    await engine.trigger('error', new Error());
    expect(engine.setCurrentStep).not.toHaveBeenCalled();
  });

  test('error hook - step id exists', async () => {
    await engine.trigger('error', new Error());
    expect(engine.setCurrentStep).toHaveBeenCalledWith({ fields: [], id: 'error' });
  });
});
