/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/__mocks__/Engine';
import valuesLoader from 'scripts/plugins/valuesLoader';

let engine = Engine();

describe('plugins/valuesLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    engine = Engine();
  });

  test('initialization - default options', () => {
    valuesLoader({})(engine);
    expect(engine.on).toHaveBeenCalledTimes(2);
    expect(engine.on).toHaveBeenNthCalledWith(1, 'loadNextStep', expect.any(Function));
    expect(engine.on).toHaveBeenNthCalledWith(2, 'loadedNextStep', expect.any(Function));
  });

  test('initialization - custom options', () => {
    valuesLoader({ enabled: false })(engine);
    expect(engine.on).toHaveBeenCalledTimes(1);
    expect(engine.on).toHaveBeenCalledWith('loadedNextStep', expect.any(Function));
  });

  test('userAction hook - null user action and null next step', async () => {
    valuesLoader({})(engine);
    await engine.trigger('loadNextStep', null);
    expect(engine.next).toHaveBeenCalledTimes(1);
    expect(engine.next).toHaveBeenCalledWith(null);
  });

  test('userAction hook - injectTo does not contain field type', async () => {
    valuesLoader({})(engine);
    await engine.trigger('loadNextStep', { fields: [{ id: 'test', type: 'Test' }] });
    expect(engine.next).toHaveBeenCalledTimes(1);
    expect(engine.next).toHaveBeenCalledWith({ fields: [{ id: 'test', type: 'Test' }] });
  });

  test('userAction hook - injectTo contains field type', async () => {
    valuesLoader({})(engine);
    await engine.trigger('loadNextStep', { fields: [{ id: 'test', type: 'Message' }] });
    expect(engine.next).toHaveBeenCalledTimes(1);
    expect(engine.next).toHaveBeenCalledWith({
      fields: [{ id: 'test', type: 'Message', options: { formValues: { test: 'value' } } }],
    });
  });

  test('loadedNextStep hook - null next step', async () => {
    valuesLoader({})(engine);
    await engine.trigger('loadedNextStep', null);
    expect(engine.next).toHaveBeenCalledTimes(1);
    expect(engine.next).toHaveBeenNthCalledWith(1, null);
  });

  test('loadedNextStep hook - next step with empty fields', async () => {
    valuesLoader({ autoSubmit: true })(engine);
    await engine.trigger('loadedNextStep', { fields: [] });
    expect(engine.loadValues).not.toHaveBeenCalled();
  });

  test('loadedNextStep hook - autoSubmit is `false`', async () => {
    valuesLoader({})(engine);
    await engine.trigger('loadedNextStep', { fields: [{ id: 'test' }, { id: 'last', value: 'value' }] });
    expect(engine.loadValues).toHaveBeenCalledTimes(1);
    expect(engine.loadValues).toHaveBeenNthCalledWith(1, { test: 'value' });
  });

  test('loadedNextStep hook - autoSubmit is `true`', async () => {
    valuesLoader({ autoSubmit: true })(engine);
    await engine.trigger('loadedNextStep', { fields: [{ id: 'test' }, { id: 'last', value: 'value' }] });
    expect(engine.loadValues).toHaveBeenCalledTimes(1);
    expect(engine.loadValues).toHaveBeenNthCalledWith(1, { test: 'value' });
  });
});
