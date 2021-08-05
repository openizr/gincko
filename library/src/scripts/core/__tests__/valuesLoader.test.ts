/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';
import valuesLoader from 'scripts/core/valuesLoader';
import MockedEngine from 'scripts/core/__mocks__/Engine';

describe('core/valuesLoader', () => {
  let engine = MockedEngine();

  beforeEach(() => {
    jest.clearAllMocks();
    engine = MockedEngine();
    valuesLoader()(engine as unknown as Engine);
  });

  test('loadNextStep hook - null next step', async () => {
    await engine.trigger('loadNextStep', null);
    expect(engine.next).toHaveBeenCalledTimes(1);
    expect(engine.next).toHaveBeenCalledWith(null);
  });

  test('loadNextStep hook - injectTo does not contain field type', async () => {
    await engine.trigger('loadNextStep', { fields: [{ id: 'test', type: 'Test' }] });
    expect(engine.next).toHaveBeenCalledTimes(1);
    expect(engine.next).toHaveBeenCalledWith({ fields: [{ id: 'test', type: 'Test' }] });
  });

  test('loadNextStep hook - injectTo contains field type', async () => {
    await engine.trigger('loadNextStep', { fields: [{ id: 'test', type: 'Message' }] });
    expect(engine.next).toHaveBeenCalledTimes(1);
    expect(engine.next).toHaveBeenCalledWith({
      fields: [{ id: 'test', type: 'Message', options: { formValues: { test: 'value' } } }],
    });
  });

  test('loadedNextStep hook - null next step', async () => {
    await engine.trigger('loadedNextStep', null);
    expect(engine.next).toHaveBeenCalledWith(null);
  });

  test('loadedNextStep hook - autoFill is `false`', async () => {
    jest.clearAllMocks();
    engine = MockedEngine({ autoFill: false });
    valuesLoader()(engine as unknown as Engine);
    await engine.trigger('loadedNextStep', { id: 'test', fields: [{ id: 'test' }, { id: 'last', value: 'value' }] });
    expect(engine.userAction).toHaveBeenCalledTimes(1);
    expect(engine.userAction).toHaveBeenNthCalledWith(1, {
      fieldId: 'last',
      value: 'value',
      stepId: 'test',
      stepIndex: 0,
      type: 'input',
    });
  });

  test('loadedNextStep hook - autoFill is `true`', async () => {
    await engine.trigger('loadedNextStep', { id: 'test', fields: [{ id: 'test' }, { id: 'last' }] });
    expect(engine.userAction).toHaveBeenCalledTimes(1);
    expect(engine.userAction).toHaveBeenNthCalledWith(1, {
      fieldId: 'test',
      value: 'value',
      stepId: 'test',
      stepIndex: 0,
      type: 'input',
    });
  });
});
