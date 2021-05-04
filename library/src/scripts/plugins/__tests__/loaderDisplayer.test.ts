/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/__mocks__/Engine';
import loaderDisplayer from 'scripts/plugins/loaderDisplayer';

jest.useFakeTimers();
describe('plugins/loaderDisplayer', () => {
  let engine = Engine();

  beforeEach(() => {
    jest.clearAllMocks();
    engine = Engine();
    loaderDisplayer({})(engine);
  });

  test('initialization - default options', async () => {
    expect(engine.hideStepLoader).not.toHaveBeenCalled();
  });

  test('initialization - custom options', () => {
    loaderDisplayer({ enabled: false })(engine);
    expect(engine.hideStepLoader).toHaveBeenCalledTimes(1);
  });

  test('userAction hook - input on first step field', async () => {
    await engine.trigger('userAction', { fieldId: 'test', type: 'input' });
    expect(engine.hideStepLoader).not.toHaveBeenCalled();
    expect(engine.displayStepLoader).not.toHaveBeenCalled();
  });

  test('userAction hook - input on last step field', async () => {
    await engine.trigger('userAction', { fieldId: 'last', type: 'input' });
    expect(engine.hideStepLoader).not.toHaveBeenCalled();
    expect(engine.displayStepLoader).toHaveBeenCalledTimes(1);
  });

  test('userAction hook - input on last step field with hooks interruption', async () => {
    await engine.trigger('userAction', { fieldId: 'last', type: 'input' }, null);
    expect(engine.hideStepLoader).toHaveBeenCalledTimes(1);
    expect(engine.displayStepLoader).toHaveBeenCalledTimes(1);
  });

  test('userAction hook - null user action', async () => {
    await engine.trigger('userAction', null);
    expect(engine.hideStepLoader).not.toHaveBeenCalled();
    expect(engine.displayStepLoader).not.toHaveBeenCalled();
  });

  test('loadNextStep hook - normal behaviour', async () => {
    await engine.trigger('userAction', null);
    const result = engine.trigger('loadNextStep', {});
    // We need the following line as `setTimeout` is called in an intermediary Promise.
    await new Promise((resolve) => setImmediate(resolve));
    jest.runAllTimers();
    await result;
    expect(engine.hideStepLoader).not.toHaveBeenCalled();
    expect(engine.displayStepLoader).not.toHaveBeenCalled();
  });

  test('loadNextStep hook - hook interruption', async () => {
    await engine.trigger('userAction', { fieldId: 'last', type: 'input' });
    const result = engine.trigger('loadNextStep', {}, null);
    // We need the following line as `setTimeout` is called in an intermediary Promise.
    await new Promise((resolve) => setImmediate(resolve));
    jest.runAllTimers();
    await result;
    expect(engine.displayStepLoader).toHaveBeenCalledTimes(1);
    expect(engine.hideStepLoader).toHaveBeenCalledTimes(1);
  });

  test('loadedNextStep hook - loader still displayed', async () => {
    await engine.trigger('userAction', { fieldId: 'last', type: 'input' });
    await engine.trigger('loadedNextStep', {});
    expect(engine.displayStepLoader).toHaveBeenCalledTimes(1);
    expect(engine.hideStepLoader).toHaveBeenCalledTimes(1);
  });

  test('loadedNextStep hook - loader not displayed', async () => {
    await engine.trigger('userAction', { fieldId: 'last', type: 'input' }, null);
    await engine.trigger('loadedNextStep', {});
    expect(engine.displayStepLoader).toHaveBeenCalledTimes(1);
    expect(engine.hideStepLoader).toHaveBeenCalledTimes(1);
  });
});
