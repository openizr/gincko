/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/__mocks__/Engine';
import valuesChecker from 'scripts/plugins/valuesChecker';

let engine = Engine();

describe('plugins/valuesChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    engine = Engine();
  });

  test('userAction hook - null user action', async () => {
    valuesChecker({})(engine);
    await engine.trigger('userAction', null);
    expect(engine.setCurrentStep).not.toHaveBeenCalled();
  });

  test('userAction hook - non input user action', async () => {
    valuesChecker({})(engine);
    await engine.trigger('userAction', { type: 'click' });
    expect(engine.setCurrentStep).toHaveBeenCalledTimes(1);
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      fields: [
        { id: 'test', type: 'Message', value: [] },
        { id: 'new', type: 'Message', value: 'ok' },
        { id: 'other', type: 'Message' },
        { id: 'last', type: 'Message', value: 'last' },
      ],
    });
  });

  test('userAction hook - invalid input on field without validation', async () => {
    valuesChecker({})(engine);
    await engine.trigger('userAction', { type: 'input', fieldId: 'last' });
    expect(engine.setCurrentStep).toHaveBeenCalledTimes(1);
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      status: 'error',
      fields: [
        {
          id: 'test', type: 'Message', value: [], status: 'initial',
        },
        {
          id: 'new', type: 'Message', value: 'ok', status: 'error', message: 'invalid',
        },
        {
          id: 'other', type: 'Message', status: 'error', message: undefined,
        },
        {
          id: 'last', type: 'Message', value: 'last', message: undefined, status: 'success',
        },
      ],
    });
  });

  test('userAction hook - invalid input on field, onSubmit is `true`', async () => {
    valuesChecker({ onSubmit: true })(engine);
    await engine.trigger('userAction', { type: 'input', fieldId: 'other' });
    expect(engine.setCurrentStep).toHaveBeenCalledTimes(1);
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      fields: [
        { id: 'test', type: 'Message', value: [] },
        { id: 'new', type: 'Message', value: 'ok' },
        { id: 'other', type: 'Message' },
        { id: 'last', type: 'Message', value: 'last' },
      ],
    });
  });

  test('userAction hook - all fields are valid', async () => {
    valuesChecker({})(engine);
    process.env.ALL_FIELDS_VALID = 'true';
    await engine.trigger('userAction', { type: 'input', fieldId: 'test' });
    expect(engine.setCurrentStep).toHaveBeenCalledTimes(1);
    delete process.env.ALL_FIELDS_VALID;
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      status: 'success',
      fields: [{
        id: 'test', type: 'Message', value: 'test', status: 'success',
      }],
    });
  });
});
