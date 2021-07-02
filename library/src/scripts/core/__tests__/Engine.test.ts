/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'diox';
import { Plugin } from 'scripts/types';
import Engine from 'scripts/core/Engine';

function flushPromises(): Promise<Json> {
  return new Promise((resolve) => setImmediate(resolve));
}

jest.mock('diox');
jest.mock('basx');
jest.mock('scripts/core/steps');
jest.mock('scripts/core/userActions');

// This trick allows to check the calling order of the different plugins.
let engine: Engine;
const call = jest.fn();
const store = new Store();
jest.mock('scripts/plugins/errorHandler', jest.fn(() => (options: Json) => (): void => {
  call('errorHandler', options);
}));
jest.mock('scripts/plugins/valuesChecker', jest.fn(() => (options: Json) => (): void => {
  call('valuesChecker', options);
}));
jest.mock('scripts/plugins/valuesUpdater', jest.fn(() => (options: Json) => (): void => {
  call('valuesUpdater', options);
}));
jest.mock('scripts/plugins/loaderDisplayer', jest.fn(() => (options: Json) => (): void => {
  call('loaderDisplayer', options);
}));
jest.mock('scripts/plugins/valuesLoader', jest.fn(() => (options: Json) => (): void => {
  call('valuesLoader', options);
}));

describe('core/Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mock('scripts/plugins/errorHandler', jest.fn(() => (options: Json) => (): void => {
      call('errorHandler', options);
    }));
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
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', { steps: [{ fields: [], id: 'test', status: 'initial' }] });
    expect(call).toHaveBeenNthCalledWith(1, 'customPlugin');
    expect(call).toHaveBeenNthCalledWith(2, 'errorHandler', undefined);
    expect(call).toHaveBeenNthCalledWith(3, 'loaderDisplayer', {});
    expect(call).toHaveBeenNthCalledWith(4, 'valuesUpdater', undefined);
    expect(call).toHaveBeenNthCalledWith(5, 'valuesChecker', {});
    expect(call).toHaveBeenNthCalledWith(6, 'valuesLoader', {});
    expect(call).toHaveBeenNthCalledWith(6, 'valuesLoader', {});
  });

  test('constructor - custom plugins values and no custom plugin', async () => {
    const valuesCheckerOptions = { onSubmit: true };
    const loaderDisplayerOptions = { enabled: false, timeout: 5000 };
    const valuesLoaderOptions = { enabled: false, autoSubmit: true, injectValuesTo: ['Test'] };
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: [] } },
      fields: {},
      loaderDisplayerOptions,
      valuesCheckerOptions,
      valuesLoaderOptions,
    });
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', { steps: [{ fields: [], id: 'test', status: 'initial' }] });
    expect(call).toHaveBeenNthCalledWith(1, 'errorHandler', undefined);
    expect(call).toHaveBeenNthCalledWith(2, 'loaderDisplayer', loaderDisplayerOptions);
    expect(call).toHaveBeenNthCalledWith(3, 'valuesUpdater', undefined);
    expect(call).toHaveBeenNthCalledWith(4, 'valuesChecker', valuesCheckerOptions);
    expect(call).toHaveBeenNthCalledWith(5, 'valuesLoader', valuesLoaderOptions);
  });

  test('handleUserAction - `null` value', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: [] } },
      fields: {},
    });
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction(null);
    expect(store.mutate).toHaveBeenCalledTimes(0);
  });

  test('handleUserAction - `null` value from plugins', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: [] } },
      fields: {},
      plugins: [((api): void => {
        api.on('userAction', (_userAction, next) => next(null));
      }) as Plugin],
    });
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction({
      type: 'input', value: 'test', fieldId: 'test', stepIndex: 0,
    });
    expect(store.mutate).toHaveBeenCalledTimes(0);
  });

  test('handleUserAction - non-null value, non-submitting step field', async () => {
    engine = new Engine({
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
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction({
      type: 'input', value: 'test', fieldId: 'test', stepIndex: 0,
    });
    expect(store.mutate).toHaveBeenCalledTimes(0);
  });

  test('handleUserAction - non-null value, submitting step field, `submit` not `true`', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'], nextStep: 'last' }, last: { fields: [] } },
      fields: { test: { type: 'Test', loadNextStep: true }, last: { type: 'Test' } },
    });
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction({
      type: 'input', value: 'test', fieldId: 'test', stepIndex: 0,
    });
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(4);
    expect(store.mutate).toHaveBeenNthCalledWith(2, 'steps', 'SET', {
      steps: [{
        fields: [
          {
            id: 'test', label: undefined, message: null, options: {}, status: 'initial', type: 'Test', value: undefined,
          },
          {
            id: 'last', label: undefined, message: null, options: {}, status: 'initial', type: 'Test', value: undefined,
          },
        ],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, submitting step field, `submit` is `true`', async () => {
    engine = new Engine({
      root: 'test',
      reCaptchaHandlerOptions: { enabled: false },
      steps: { test: { fields: ['test'], submit: true } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('submit', (_data, next) => next(null));
      }) as Plugin],
    });
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction({
      type: 'input', value: 'test', fieldId: 'test', stepIndex: 0,
    });
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test', label: undefined, message: null, options: {}, status: 'initial', type: 'Test', value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, submitting step field, nextStep is `null`', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: null } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('submit', (_data, next) => next(null));
      }) as Plugin],
    });
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction({
      type: 'input', value: 'test', fieldId: 'test', stepIndex: 0,
    });
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test', label: undefined, message: null, options: {}, status: 'initial', type: 'Test', value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, submitting step field, loaded next step is `null`', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: null } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('loadedNextStep', (_data, next) => next(null));
      }) as Plugin],
    });
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction({
      type: 'input', value: 'test', fieldId: 'test', stepIndex: 0,
    });
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test', label: undefined, message: null, options: {}, status: 'initial', type: 'Test', value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, `nextStep` is a function', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: (): null => null } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('submit', (_data, next) => next(null));
      }) as Plugin],
    });
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction({
      type: 'input', value: 'test', fieldId: 'test', stepIndex: 0,
    });
    await flushPromises();
    expect(store.mutate).toHaveBeenCalledTimes(2);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test', label: undefined, message: null, options: {}, status: 'initial', type: 'Test', value: undefined,
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
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
      plugins: [((api): void => {
        api.on('error', () => {
          throw new Error('test');
        });
        api.on('error', (error: Error, next: (error: Error) => Promise<void>) => {
          call(error);
          return next(error);
        });
        api.on('loadNextStep', () => Promise.resolve().then(() => {
          call(engine);
        }));
      })],
    });
    await flushPromises();
    expect(call).toHaveBeenCalledWith(new Error('test'));
  });

  test('getConfiguration', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    };
    engine = new Engine(configuration);
    expect(engine.getConfiguration()).toEqual(configuration);
    expect(engine.getConfiguration()).not.toBe(configuration);
  });

  test('createField - field exists, non-interactive', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Message' } },
    };
    engine = new Engine(configuration);
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

  test('createField - field exists, interactive', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    };
    engine = new Engine(configuration);
    expect(engine.createField('test')).toEqual({
      id: 'test',
      label: undefined,
      message: null,
      options: {},
      status: 'initial',
      type: 'Test',
      value: undefined,
    });
  });

  test('createField - field does not exist', () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    });
    expect(() => engine.createField('other')).toThrow(new Error('Field "other" does not exist.'));
  });

  test('createStep - step exists', () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    });
    expect(engine.createStep('test')).toEqual({
      id: 'test',
      status: 'initial',
      fields: [{
        id: 'test',
        label: undefined,
        message: null,
        options: {},
        status: 'initial',
        type: 'Test',
        value: undefined,
      }],
    });
  });

  test('createStep - step does not exist', () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    });
    expect(() => engine.createStep('other')).toThrow(new Error('Step "other" does not exist.'));
  });

  test('getValues', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    });
    (engine as Json).formValues.test = 'testValue';
    await flushPromises();
    jest.clearAllMocks();
    expect(engine.getValues()).toEqual((engine as Json).formValues);
    expect(engine.getValues()).not.toBe((engine as Json).formValues);
  });

  test('loadValues', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    });
    await flushPromises();
    jest.clearAllMocks();
    engine.loadValues({ test: 'test', other: 'other' });
    expect(store.mutate).toHaveBeenCalledTimes(1);
    expect(store.mutate).toHaveBeenCalledWith('userActions', 'ADD', {
      fieldId: 'test', stepIndex: 0, type: 'input', value: 'test',
    });
  });

  test('getStore', () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    });
    expect(store).toBe(engine.getStore());
  });

  test('getFieldIndex - existing field', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    });
    await flushPromises();
    expect(engine.getFieldIndex('last')).toBe(1);
  });

  test('getFieldIndex - non-existing field', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    });
    expect(engine.getFieldIndex('unknown')).toBe(-1);
  });

  test('getCurrentStep', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    });
    process.env.DEEP_COPY = 'undefined';
    expect(engine.getCurrentStep()).toBeNull();
    delete process.env.DEEP_COPY;
    await flushPromises();
    expect(engine.getCurrentStep()).toEqual((engine as Json).generatedSteps[0]);
    expect(engine.getCurrentStep()).not.toBe((engine as Json).generatedSteps[0]);
  });

  test('setCurrentStep - no notification', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    });
    await flushPromises();
    jest.clearAllMocks();
    engine.setCurrentStep({
      id: 'test',
      status: 'initial',
      fields: [],
    });
    expect(store.mutate).not.toHaveBeenCalled();
  });

  test('on', () => {
    engine = new Engine({
      root: 'test',
      reCaptchaHandlerOptions: { enabled: false },
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    });
    engine.on('submit', (data, next) => next(data));
    expect((engine as Json).hooks).toEqual({
      error: [],
      loadNextStep: [],
      loadedNextStep: [],
      submit: [expect.any(Function)],
      userAction: [],
    });
  });

  test('toggleStepLoader', async () => {
    engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    });
    await flushPromises();
    jest.clearAllMocks();
    engine.toggleStepLoader(true);
    expect(store.mutate).toHaveBeenCalledTimes(1);
    expect(store.mutate).toHaveBeenCalledWith('steps', 'SET_LOADER', { loadingNextStep: true });
  });
});
