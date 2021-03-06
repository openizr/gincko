/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';
import valuesUpdater from 'scripts/core/valuesUpdater';
import MockedEngine from 'scripts/core/__mocks__/Engine';

describe('core/valuesUpdater', () => {
  let engine = MockedEngine();

  beforeEach(() => {
    jest.clearAllMocks();
    engine = MockedEngine();
    valuesUpdater()(engine as unknown as Engine);
  });

  test('userAction hook - null user action', async () => {
    await engine.trigger('userAction', null);
    expect(engine.setCurrentStep).not.toHaveBeenCalled();
  });

  test('userAction hook - non-input user action', async () => {
    await engine.trigger('userAction', { type: 'click' });
    expect(engine.setCurrentStep).not.toHaveBeenCalled();
  });

  test('userAction hook - normal user action', async () => {
    process.env.LAST_FIELD = 'true';
    await engine.trigger('userAction', { fieldId: 'last', type: 'input', value: 'initialValue' });
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      id: 'test',
      fields: [
        { id: 'test', type: 'Message', value: [] },
        { id: 'new', type: 'Message', value: 'ok' },
        { id: 'other', type: 'Message' },
        {
          id: 'last',
          message: null,
          status: 'initial',
          type: 'Message',
          value: 'initialValue',
          options: {
            modifiers: 'test',
          },
        },
      ],
      status: 'progress',
    });
    delete process.env.LAST_FIELD;
  });
});
