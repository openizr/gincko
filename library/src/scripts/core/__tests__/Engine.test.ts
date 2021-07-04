/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'diox';
import localforage from 'localforage';
import Engine, { Configuration, Plugin, UserAction } from 'scripts/core/Engine';

jest.mock('diox');
jest.mock('basx');
jest.mock('localforage');
jest.mock('scripts/core/steps');
jest.mock('scripts/core/userActions');
jest.useFakeTimers();

// This trick allows to check the calling order of the different plugins.
const call = jest.fn();
jest.mock('scripts/core/errorHandler', jest.fn(() => () => (): void => {
  call('errorHandler');
}));
jest.mock('scripts/core/valuesChecker', jest.fn(() => () => (): void => {
  call('valuesChecker');
}));
jest.mock('scripts/core/valuesUpdater', jest.fn(() => () => (): void => {
  call('valuesUpdater');
}));
jest.mock('scripts/core/valuesLoader', jest.fn(() => () => (): void => {
  call('valuesLoader');
}));

describe('core/Engine', () => {
  let engine: Engine;
  const store = new Store();
  const userAction: UserAction = {
    stepId: 'test',
    type: 'input',
    value: 'test',
    fieldId: 'test',
    stepIndex: 0,
  };

  function flushPromises(): Promise<Json> {
    return new Promise((resolve) => setImmediate(resolve));
  }

  async function createEngine(configuration: Configuration): Promise<void> {
    engine = new Engine(configuration);
    await flushPromises();
    jest.clearAllMocks();
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('constructor - default plugins values and a custom plugin', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: [] } },
      fields: {},
      plugins: [
        jest.fn(() => call('customPlugin')),
      ],
    });
    await flushPromises();
    expect(call).toHaveBeenNthCalledWith(1, 'customPlugin');
    expect(call).toHaveBeenNthCalledWith(2, 'errorHandler');
    expect(call).toHaveBeenNthCalledWith(3, 'valuesUpdater');
    expect(call).toHaveBeenNthCalledWith(4, 'valuesChecker');
    expect(call).toHaveBeenNthCalledWith(5, 'valuesLoader');
  });

  test('constructor - `restartOnReload` is true', async () => {
    process.env.CACHE_EXISTING_FORM = 'true';
    engine = new Engine({
      root: 'test',
      restartOnReload: true,
      steps: { test: { fields: [] } },
      fields: {},
      checkValuesOnSubmit: true,
    });
    await flushPromises();
    expect(engine.getValues()).toEqual({ test: 'value' });
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [],
        id: 'test',
        status: 'initial',
      }],
    });
    delete process.env.CACHE_EXISTING_FORM;
  });

  test('constructor - custom plugins values and no custom plugin, `autoFill` is false', async () => {
    process.env.CACHE_EXISTING_FORM = 'true';
    engine = new Engine({
      root: 'test',
      autoFill: false,
      steps: { test: { fields: [] } },
      fields: {},
      checkValuesOnSubmit: true,
    });
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [
          {
            id: 'test',
            label: undefined,
            message: null,
            options: {},
            status: 'initial',
            type: 'Test',
            value: undefined,
          },
          {
            id: 'last',
            label: undefined,
            message: null,
            options: {},
            status: 'initial',
            type: 'Test',
            value: undefined,
          },
        ],
        id: 'test',
        status: 'initial',
      }],
    });
    expect(engine.getValues()).toEqual({});
    expect(call).toHaveBeenNthCalledWith(1, 'errorHandler');
    expect(call).toHaveBeenNthCalledWith(2, 'valuesUpdater');
    expect(call).toHaveBeenNthCalledWith(3, 'valuesChecker');
    expect(call).toHaveBeenNthCalledWith(4, 'valuesLoader');
    delete process.env.CACHE_EXISTING_FORM;
  });

  test('handleUserAction - `null` value', async () => {
    await createEngine({
      root: 'test',
      steps: { test: { fields: [] } },
      fields: {},
    });
    (engine as Json).handleUserAction(null);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(1);
  });

  test('handleUserAction - `null` value from plugins', async () => {
    await createEngine({
      root: 'test',
      steps: { test: { fields: [] } },
      fields: {},
      plugins: [<Plugin>((api) => {
        api.on('userAction', (_userAction, next) => next(null));
      })],
    });
    (engine as Json).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(1);
  });

  test('handleUserAction - non-null value, non-submitting step field', async () => {
    await createEngine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: {
        test: {
          type: 'Test',
        },
        last: {
          type: 'Test',
        },
      },
    });
    (engine as Json).handleUserAction(userAction);
    await flushPromises();
    jest.runAllTimers();
    expect(localforage.setItem).toHaveBeenCalled();
    expect(store.mutate).toHaveBeenCalledTimes(1);
  });

  test('handleUserAction - non-null value, submitting step field, `submit` not `true`', async () => {
    await createEngine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'], nextStep: 'last' }, last: { fields: [] } },
      fields: { test: { type: 'Test', loadNextStep: true }, last: { type: 'Test' } },
    });
    (engine as Json).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(4);
    expect(store.mutate).toHaveBeenNthCalledWith(2, 'steps', 'SET', {
      steps: [{
        fields: [
          {
            id: 'test',
            label: undefined,
            message: null,
            options: {},
            status: 'initial',
            type: 'Test',
            value: undefined,
          },
          {
            id: 'last',
            label: undefined,
            message: null,
            options: {},
            status: 'initial',
            type: 'Test',
            value: undefined,
          },
        ],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, submitting step field, `submit` is `true`', async () => {
    await createEngine({
      root: 'test',
      steps: { test: { fields: ['test'], submit: true } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('submit', (_data, next) => next(null));
      }) as Plugin],
    });
    (engine as Json).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test',
          label: undefined,
          message: null,
          options: {},
          status: 'initial',
          type: 'Test',
          value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, submitting step field, nextStep is `null`', async () => {
    await createEngine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: null } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('submit', (_data, next) => next(null));
      }) as Plugin],
    });
    (engine as Json).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test',
          label: undefined,
          message: null,
          options: {},
          status: 'initial',
          type: 'Test',
          value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, submitting step field, loaded next step is `null`', async () => {
    await createEngine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: null } },
      fields: { test: { type: 'Test' } },
      plugins: [<Plugin>((api): void => {
        api.on('loadedNextStep', (_data, next) => next(null));
      })],
    });
    (engine as Json).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test',
          label: undefined,
          message: null,
          options: {},
          status: 'initial',
          type: 'Test',
          value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, `nextStep` is a function', async () => {
    await createEngine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: (): null => null } },
      fields: { test: { type: 'Test' } },
      plugins: [<Plugin>((api): void => {
        api.on('submit', (_data, next) => next(null));
      })],
    });
    (engine as Json).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test',
          label: undefined,
          message: null,
          options: {},
          status: 'initial',
          type: 'Test',
          value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('triggerHooks - hook does not return a Promise', (done) => {
    const handleError = (error: Error): void => {
      expect(error.message).toBe('Event "loadNextStep": all your hooks must return a Promise.');
      done();
    };
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('error', (error: Error, next: (error: Error) => Promise<void>) => {
          setImmediate(() => {
            handleError(error);
          });
          return next(error);
        });
        api.on('loadNextStep', () => { call(engine); });
      })],
    });
  });

  test('triggerHooks - hook does not return valid data', (done) => {
    const handleError = (error: Error): void => {
      expect(error.message).toBe(
        'Event "loadNextStep": data passed to the next hook is "undefined". '
        + 'This usually means that you did not correctly resolved your hook\'s Promise '
        + 'with proper data.',
      );
      done();
    };
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('error', (error: Error, next: (error: Error) => Promise<void>) => {
          setImmediate(() => {
            handleError(error);
          });
          return next(error);
        });
        api.on('loadNextStep', () => Promise.resolve().then(() => {
          call(engine);
        }));
      })],
    });
  });

  test('triggerHooks - hook throws an error in an error hook', async () => {
    await createEngine({
      root: 'test',
      steps: { test: { fields: ['last'] } },
      fields: { last: { type: 'Radio' } },
      plugins: [<Plugin>((api) => {
        api.on('error', () => {
          throw new Error('test');
        });
        api.on('error', (error, next) => {
          call(error);
          return next(error);
        });
        api.on('userAction', () => {
          throw new Error('nextStep');
        });
      })],
    });
    (engine as Json).handleUserAction(null);
    await flushPromises();
    expect(call).toHaveBeenCalledWith(new Error('test'));
  });

  test('getConfiguration', async () => {
    const configuration = { root: 'test', steps: { test: { fields: [] } }, fields: {} };
    await createEngine(configuration);
    expect(engine.getConfiguration()).toBe(configuration);
  });

  test('createField - field exists, non-interactive', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: ['test'] } }, fields: { test: { type: 'Radio' } } });
    expect(engine.createField('test')).toEqual({
      id: 'test',
      label: undefined,
      message: null,
      options: {},
      status: 'initial',
      type: 'Radio',
      value: undefined,
    });
  });

  test('createField - field exists, interactive', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: ['test'] } }, fields: { test: { type: 'Message' } } });
    expect(engine.createField('test')).toEqual({
      id: 'test',
      label: undefined,
      message: null,
      options: {},
      status: 'success',
      type: 'Message',
      value: undefined,
    });
  });

  test('createField - field does not exist', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    expect(() => engine.createField('other')).toThrow(new Error('Field "other" does not exist.'));
  });

  test('createStep - `null` stepId', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    expect(engine.createStep(null)).toBeNull();
  });

  test('createStep - step exists', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: ['last'] } }, fields: { last: { type: 'Message' } } });
    expect(engine.createStep('test')).toEqual({
      id: 'test',
      status: 'initial',
      fields: [{
        id: 'last',
        label: undefined,
        message: null,
        options: {},
        status: 'success',
        type: 'Message',
        value: undefined,
      }],
    });
  });

  test('createStep - step does not exist', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    expect(() => engine.createStep('other')).toThrow(new Error('Step "other" does not exist.'));
  });

  test('getValues & setValues', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    engine.setValues({ test: 'test', other: 'other' });
    expect(engine.getValues()).toEqual({ test: 'test', other: 'other' });
  });

  test('getStore', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    expect(store).toBe(engine.getStore());
  });

  test('getFieldIndex - existing field', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: ['last'] } }, fields: { last: { type: 'Message' } } });
    expect(engine.getFieldIndex('last')).toBe(0);
  });

  test('getFieldIndex - unexisting step', async () => {
    let fieldIndex = 0;
    await createEngine({
      root: 'test',
      steps: { test: { fields: ['last'] } },
      fields: { last: { type: 'Message' } },
      plugins: [<Plugin>((api) => {
        api.on('loadNextStep', (nextStep, next) => {
          fieldIndex = engine.getFieldIndex('last');
          return next(nextStep);
        });
      })],
    });
    expect(fieldIndex).toBe(-1);
  });

  test('getFieldIndex - unexisting field', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    expect(engine.getFieldIndex('unknown')).toBe(-1);
  });

  test('getCurrentStep', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    process.env.DEEP_COPY = 'undefined';
    expect(engine.getCurrentStep()).toBeNull();
    delete process.env.DEEP_COPY;
    expect(engine.getCurrentStep()).toEqual({ fields: [], id: 'test', status: 'initial' });
  });

  test('setCurrentStep - with notification', async () => {
    const step = { id: 'test', status: 'progress', fields: [] };
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    engine.setCurrentStep(step, true);
    expect(engine.getCurrentStep()).toEqual(step);
    expect(store.mutate).toHaveBeenCalledTimes(1);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', { steps: [step] });
  });

  test('setCurrentStep - no notification', async () => {
    const step = { id: 'test', status: 'progress', fields: [] };
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    engine.setCurrentStep(step);
    expect(engine.getCurrentStep()).toEqual(step);
    expect(store.mutate).not.toHaveBeenCalled();
  });

  test('on', async () => {
    const hook = jest.fn((data, next) => next(data));
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    engine.on('submit', hook);
    await (engine as Json).triggerHooks('submit', { test: 'value' });
    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith({ test: 'value' }, expect.any(Function));
  });

  test('toggleStepLoader', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    engine.toggleStepLoader(true);
    expect(store.mutate).toHaveBeenCalledTimes(1);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET_LOADER', { loadingNextStep: true });
  });

  test('userAction', async () => {
    await createEngine({ root: 'test', steps: { test: { fields: [] } }, fields: {} });
    engine.userAction(userAction);
    expect(store.mutate).toHaveBeenCalledTimes(1);
    expect(store.mutate).toHaveBeenCalledWith('userActions', 'ADD', userAction);
  });
});
