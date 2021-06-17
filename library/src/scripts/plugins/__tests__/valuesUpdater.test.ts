/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/__mocks__/Engine';
import valuesUpdater from 'scripts/plugins/valuesUpdater';

let engine = Engine();

describe('plugins/valuesUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    engine = Engine();
  });

  test('userAction hook - null user action', async () => {
    valuesUpdater()(engine);
    await engine.trigger('userAction', null);
    expect(engine.setCurrentStep).not.toHaveBeenCalled();
  });

  test('userAction hook - non-input user action', async () => {
    valuesUpdater()(engine);
    await engine.trigger('userAction', { type: 'click' });
    expect(engine.setCurrentStep).not.toHaveBeenCalled();
  });

  test('userAction hook - normal user action on transformable field', async () => {
    valuesUpdater()(engine);
    await engine.trigger('userAction', { fieldId: 'test', type: 'input' });
    expect(engine.setCurrentStep).toHaveBeenCalledTimes(1);
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      fields: [
        {
          id: 'test', message: null, status: 'initial', type: 'Message', value: 'transformedValue',
        },
        { id: 'new', type: 'Message', value: 'ok' },
        { id: 'other', type: 'Message' },
        { id: 'last', type: 'Message', value: 'last' },
      ],
      status: 'progress',
    });
  });

  test('userAction hook - normal user action on non-transformable field', async () => {
    valuesUpdater()(engine);
    process.env.LAST_FIELD = 'true';
    await engine.trigger('userAction', { fieldId: 'last', type: 'input', value: 'initialValue' });
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      fields: [
        { id: 'test', type: 'Message', value: [] },
        { id: 'new', type: 'Message', value: 'ok' },
        { id: 'other', type: 'Message' },
        {
          id: 'last', message: null, status: 'initial', type: 'Message', value: 'initialValue',
        },
      ],
      status: 'progress',
    });
    delete process.env.LAST_FIELD;
  });
});
