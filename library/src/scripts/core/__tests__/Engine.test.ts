/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'diox';
import localforage from 'localforage';
import { Configuration } from 'scripts/propTypes/configuration';
import Engine, { Plugin, UserAction, AnyValues } from 'scripts/core/Engine';

type EngineApi = {
  values: AnyValues;
  handleUserAction: (arg: UserAction | null) => void;
  triggerHooks: (name: string, data?: Record<string, string>) => void;
};

jest.mock('diox');
jest.mock('basx');
jest.mock('localforage');
jest.mock('scripts/core/state');
jest.mock('scripts/core/userActions');

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
  const store = new Store();
  const configuration: Configuration = {
    variables: { var1: 'test1', var2: 'test2' },
    root: 'test',
    steps: { test: { fields: ['last'] } },
    fields: { last: { type: 'Message' } },
  };
  const userAction: UserAction = {
    stepId: 'test',
    type: 'input',
    value: 'test',
    fieldId: 'test',
    stepIndex: 0,
  };

  async function flushPromises(): Promise<void> {
    const promise = new Promise<void>((resolve) => setTimeout(resolve, 50));
    return promise;
  }

  async function createEngine(conf: Configuration = configuration, flush = true): Promise<Engine> {
    const engine = new Engine(conf);
    if (flush) {
      await flushPromises();
      jest.clearAllMocks();
    }
    return engine;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CACHE_EXISTING_FORM;
  });

  test('constructor - default plugins values and a custom plugin', async () => {
    await createEngine({
      ...configuration,
      plugins: [
        jest.fn(() => call('customPlugin')),
      ],
    }, false);
    expect(call).toHaveBeenNthCalledWith(1, 'customPlugin');
    expect(call).toHaveBeenNthCalledWith(2, 'errorHandler');
    expect(call).toHaveBeenNthCalledWith(3, 'valuesUpdater');
    expect(call).toHaveBeenNthCalledWith(4, 'valuesChecker');
    expect(call).toHaveBeenNthCalledWith(5, 'valuesLoader');
  });

  test('constructor - start hook returns correct value', async () => {
    const callback = jest.fn();
    const create = (): Engine => new Engine({
      ...configuration,
      plugins: [
        ((engine) => {
          engine.on('start', (data, next) => {
            callback(data);
            return next(data);
          });
        }) as Plugin,
      ],
    });
    create();
    await flushPromises();
    expect(callback).toHaveBeenCalledWith(undefined);
  });

  test('constructor - start hook returns null', async () => {
    await createEngine({
      ...configuration,
      plugins: [
        ((engine) => {
          engine.on('start', (_data, next) => next(null));
        }) as Plugin,
      ],
    });
    expect(store.mutate).not.toHaveBeenCalled();
  });

  test('constructor - root step does not exist', async () => {
    const callback = jest.fn();
    await createEngine({
      ...configuration,
      root: 'other',
      plugins: [
        ((engine) => {
          engine.on('error', (error, next) => {
            callback(error);
            return next(error);
          });
        }) as Plugin,
      ],
    }, false);
    await flushPromises();
    expect(callback).toHaveBeenCalledWith(new Error('Step "other" does not exist.'));
  });

  test('constructor - `restartOnReload` is true', async () => {
    process.env.CACHE_EXISTING_FORM = 'true';
    const engine = await createEngine({
      ...configuration,
      restartOnReload: true,
    }, false);
    await flushPromises();
    expect(engine.getValues()).toEqual({ test: 'value' });
    expect(store.mutate).toHaveBeenCalledWith('state', 'UPDATE', {
      values: { test: 'value' },
      variables: { var1: 'test1', var2: 'test2' },
      steps: [{
        fields: [{
          id: 'last',
          label: undefined,
          message: null,
          options: {},
          status: 'success',
          type: 'Message',
          value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('constructor - custom plugins values and no custom plugin, `autoFill` is false', async () => {
    process.env.CACHE_EXISTING_FORM = 'true';
    const engine = new Engine({ ...configuration, autoFill: false });
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('state', 'UPDATE', {
      values: {},
      variables: { var1: 'test1', var2: 'test2' },
      steps: [{
        fields: [{
          id: 'last',
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
    expect(engine.getValues()).toEqual({});
    expect(call).toHaveBeenNthCalledWith(1, 'errorHandler');
    expect(call).toHaveBeenNthCalledWith(2, 'valuesUpdater');
    expect(call).toHaveBeenNthCalledWith(3, 'valuesChecker');
    expect(call).toHaveBeenNthCalledWith(4, 'valuesLoader');
  });

  test('handleUserAction - `null` value', async () => {
    const engine = await createEngine();
    (engine as unknown as EngineApi).handleUserAction(null);
    expect(store.mutate).not.toHaveBeenCalled();
  });

  test('handleUserAction - non-input action', async () => {
    const engine = await createEngine();
    (engine as unknown as EngineApi).handleUserAction({ ...userAction, type: 'click' });
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(1);
    expect(store.mutate).toHaveBeenCalledWith('state', 'UPDATE', {
      values: {},
      variables: {},
      steps: [{
        fields: [{
          id: 'last',
          label: undefined,
          message: null,
          options: {},
          status: 'success',
          type: 'Message',
          value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - `null` value from plugins', async () => {
    const engine = await createEngine({
      ...configuration,
      plugins: [<Plugin>((api) => {
        api.on('userAction', (_userAction, next) => next(null));
      })],
    });
    (engine as unknown as EngineApi).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(1);
  });

  test('handleUserAction - non-null value, non-submitting step field', async () => {
    const engine = await createEngine({
      ...configuration,
      steps: { test: { fields: ['test', 'last'] } },
      fields: {
        test: {
          type: 'Test',
          options: {
            prop: 3,
            callback: () => null,
          },
        },
        last: {
          type: 'Test',
        },
      },
    });
    (engine as unknown as EngineApi).handleUserAction(userAction);
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    expect(localforage.setItem).toHaveBeenCalled();
    expect(localforage.setItem).toHaveBeenCalledWith('gincko_cache', {
      values: { test: 'value' },
      variables: { var1: 'test1', var2: 'test2' },
      steps: [{
        fields: [{
          id: 'last',
          label: undefined,
          message: null,
          options: {},
          status: 'success',
          type: 'Message',
          value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
    expect(store.mutate).toHaveBeenCalledTimes(1);
  });

  test('handleUserAction - non-null value, submitting step field, `submit` not `true`', async () => {
    const engine = await createEngine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'], nextStep: 'last' }, last: { fields: [] } },
      fields: { test: { type: 'Test', loadNextStep: true }, last: { type: 'Test' } },
    });
    (engine as unknown as EngineApi).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(4);
    expect(store.mutate).toHaveBeenNthCalledWith(2, 'state', 'UPDATE', {
      values: { test: 'test' },
      variables: {},
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
    const engine = await createEngine({
      root: 'test',
      steps: { test: { fields: ['test'], submit: true } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('submit', (_data, next) => next(null));
      }) as Plugin],
    });
    (engine as unknown as EngineApi).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('state', 'UPDATE', {
      values: { test: 'test' },
      variables: {},
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
    const engine = await createEngine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: null } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('submit', (_data, next) => next(null));
      }) as Plugin],
    });
    (engine as unknown as EngineApi).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('state', 'UPDATE', {
      values: { test: 'test' },
      variables: {},
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
    const engine = await createEngine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: null } },
      fields: { test: { type: 'Test' } },
      plugins: [<Plugin>((api): void => {
        api.on('loadedNextStep', (_data, next) => next(null));
      })],
    });
    (engine as unknown as EngineApi).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('state', 'UPDATE', {
      values: { test: 'test' },
      variables: {},
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
    const engine = await createEngine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: (): null => null } },
      fields: { test: { type: 'Test' } },
      plugins: [<Plugin>((api): void => {
        api.on('submit', (_data, next) => next(null));
      })],
    });
    (engine as unknown as EngineApi).handleUserAction(userAction);
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('state', 'UPDATE', {
      values: { test: 'test' },
      variables: {},
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
    const engine = new Engine({
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
    const engine = new Engine({
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
    const engine = await createEngine({
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
    (engine as unknown as EngineApi).handleUserAction({
      fieldId: '', stepId: '', stepIndex: 0, type: 'click', value: '',
    });
    await flushPromises();
    expect(call).toHaveBeenCalledWith(new Error('test'));
  });

  test('triggerHooks - submit form with clearCacheOnSubmit set to `false`', async () => {
    const engine = await createEngine({
      root: 'test',
      clearCacheOnSubmit: false,
      steps: { test: { fields: ['last'] } },
      fields: { last: { type: 'Radio' } },
    });
    await (engine as unknown as EngineApi).triggerHooks('submit');
    expect(localforage.removeItem).not.toHaveBeenCalled();
  });

  test('getConfiguration', async () => {
    const engine = await createEngine();
    expect(engine.getConfiguration()).toBe(configuration);
  });

  test('createField - field exists, interactive', async () => {
    const engine = await createEngine({ ...configuration, fields: { test: { type: 'Radio' } } });
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

  test('createField - field exists, non-interactive', async () => {
    const engine = await createEngine();
    expect(engine.createField('last')).toEqual({
      id: 'last',
      label: undefined,
      message: null,
      options: {},
      status: 'success',
      type: 'Message',
      value: undefined,
    });
  });

  test('createField - field does not exist', async () => {
    const engine = await createEngine();
    expect(() => engine.createField('other')).toThrow(new Error('Field "other" does not exist.'));
  });

  test('createStep - null stepId', async () => {
    const engine = await createEngine();
    expect(engine.createStep(null)).toBeNull();
  });

  test('createStep - step exists', async () => {
    const engine = await createEngine({ root: 'test', steps: { test: { fields: ['last'] } }, fields: { last: { type: 'Message' } } });
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
    const engine = await createEngine();
    expect(() => engine.createStep('other')).toThrow(new Error('Step "other" does not exist.'));
  });

  test('getStore', async () => {
    const engine = await createEngine();
    expect(store).toBe(engine.getStore());
  });

  test('getFieldIndex - unexisting step', async () => {
    let fieldIndex = 0;
    await createEngine({
      ...configuration,
      plugins: [<Plugin>((engine) => {
        engine.on('loadNextStep', (nextStep, next) => {
          fieldIndex = engine.getFieldIndex('last');
          return next(nextStep);
        });
      })],
    });
    expect(fieldIndex).toBe(-1);
  });

  test('getFieldIndex - unexisting field', async () => {
    const engine = await createEngine();
    expect(engine.getFieldIndex('unknown')).toBe(-1);
  });

  test('getCurrentStepIndex', async () => {
    const engine = await createEngine();
    expect(engine.getCurrentStepIndex()).toBe(0);
  });

  test('getCurrentStep - null step', async () => {
    process.env.DEEP_COPY = 'undefined';
    const engine = await createEngine();
    expect(engine.getCurrentStep()).toBeNull();
    delete process.env.DEEP_COPY;
  });

  test('setCurrentStep - with notification', async () => {
    const engine = await createEngine();
    const step = { id: 'test', status: 'progress', fields: [] };
    engine.setCurrentStep(step, true);
    expect(engine.getCurrentStep()).toEqual(step);
    expect(store.mutate).toHaveBeenCalledTimes(1);
    expect(store.mutate).toHaveBeenCalledWith('state', 'UPDATE', {
      values: {},
      variables: {},
      steps: [step],
    });
  });

  test('setCurrentStep - no notification', async () => {
    const engine = await createEngine();
    const step = { id: 'test', status: 'progress', fields: [] };
    engine.setCurrentStep(step);
    expect(engine.getCurrentStep()).toEqual(step);
    expect(store.mutate).not.toHaveBeenCalled();
  });

  test('on', async () => {
    const hook = jest.fn((data, next) => next(data));
    const engine = await createEngine();
    engine.on('submit', hook);
    await (engine as unknown as EngineApi).triggerHooks('submit', { test: 'value' });
    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith({ test: 'value' }, expect.any(Function));
  });

  test('toggleStepLoader', async () => {
    const engine = await createEngine();
    engine.toggleStepLoader(true);
    expect(store.mutate).toHaveBeenCalledTimes(1);
    expect(store.mutate).toHaveBeenCalledWith('state', 'SET_LOADER', { loadingNextStep: true });
  });

  test('userAction', async () => {
    const engine = await createEngine();
    engine.userAction(userAction);
    expect(store.mutate).toHaveBeenCalledTimes(1);
    expect(store.mutate).toHaveBeenCalledWith('userActions', 'ADD', userAction);
  });

  test('getValues', async () => {
    const engine = await createEngine();
    (engine as unknown as EngineApi).values = { last: 'test' };
    expect(engine.getValues()).toEqual({ last: 'test' });
  });

  test('clearCache', async () => {
    const engine = await createEngine();
    await engine.clearCache();
    expect(localforage.removeItem).toHaveBeenCalledWith('gincko_cache');
  });

  test('setVariables and getVariables', async () => {
    process.env.CACHE_EXISTING_FORM = 'true';
    const engine = await createEngine();
    engine.setVariables({ var1: 'test2', var3: 'test3' });
    expect(engine.getVariables()).toEqual({ var1: 'test2', var2: 'test2', var3: 'test3' });
  });
});
