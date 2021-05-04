/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

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
console.log = jest.fn(); // eslint-disable-line no-console
const consolelog = console.log; // eslint-disable-line no-console
jest.mock('scripts/plugins/errorHandler', jest.fn(() => (options: Json): () => void => (): void => {
  console.log('errorHandler', options); // eslint-disable-line no-console
}));
jest.mock('scripts/plugins/valuesChecker', jest.fn(() => (options: Json): () => void => (): void => {
  console.log('valuesChecker', options); // eslint-disable-line no-console
}));
jest.mock('scripts/plugins/valuesUpdater', jest.fn(() => (options: Json): () => void => (): void => {
  console.log('valuesUpdater', options); // eslint-disable-line no-console
}));
jest.mock('scripts/plugins/loaderDisplayer', jest.fn(() => (options: Json): () => void => (): void => {
  console.log('loaderDisplayer', options); // eslint-disable-line no-console
}));
jest.mock('scripts/plugins/valuesLoader', jest.fn(() => (options: Json): () => void => (): void => {
  console.log('valuesLoader', options); // eslint-disable-line no-console
}));

describe('core/Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('constructor - default plugins values and a custom plugin', async () => {
    const engine = new Engine({
      root: 'test',
      steps: { test: { fields: [] } },
      fields: {},
      plugins: [
        jest.fn((): void => {
          console.log('customPlugin'); // eslint-disable-line no-console
        }),
      ],
    });
    await flushPromises();
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(2);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('steps', 'SET', { steps: [{ fields: [], id: 'test', status: 'initial' }] });
    expect(consolelog).toHaveBeenNthCalledWith(1, 'customPlugin');
    expect(consolelog).toHaveBeenNthCalledWith(2, 'errorHandler', undefined);
    expect(consolelog).toHaveBeenNthCalledWith(3, 'loaderDisplayer', {});
    expect(consolelog).toHaveBeenNthCalledWith(4, 'valuesUpdater', undefined);
    expect(consolelog).toHaveBeenNthCalledWith(5, 'valuesChecker', {});
    expect(consolelog).toHaveBeenNthCalledWith(6, 'valuesLoader', {});
    expect(consolelog).toHaveBeenNthCalledWith(6, 'valuesLoader', {});
  });

  test('constructor - custom plugins values and no custom plugin', async () => {
    const valuesCheckerOptions = { onSubmit: true };
    const loaderDisplayerOptions = { enabled: false, timeout: 5000 };
    const valuesLoaderOptions = { enabled: false, autoSubmit: true, injectValuesTo: ['Test'] };
    const engine = new Engine({
      root: 'test',
      steps: { test: { fields: [] } },
      fields: {},
      loaderDisplayerOptions,
      valuesCheckerOptions,
      valuesLoaderOptions,
    });
    await flushPromises();
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(2);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('steps', 'SET', { steps: [{ fields: [], id: 'test', status: 'initial' }] });
    expect(consolelog).toHaveBeenNthCalledWith(1, 'errorHandler', undefined);
    expect(consolelog).toHaveBeenNthCalledWith(2, 'loaderDisplayer', loaderDisplayerOptions);
    expect(consolelog).toHaveBeenNthCalledWith(3, 'valuesUpdater', undefined);
    expect(consolelog).toHaveBeenNthCalledWith(4, 'valuesChecker', valuesCheckerOptions);
    expect(consolelog).toHaveBeenNthCalledWith(5, 'valuesLoader', valuesLoaderOptions);
  });

  test('handleUserAction - `null` value', async () => {
    const engine = new Engine({
      root: 'test',
      steps: { test: { fields: [] } },
      fields: {},
    });
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction(null);
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(0);
  });

  test('handleUserAction - `null` value from plugins', async () => {
    const engine = new Engine({
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
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(0);
  });

  test('handleUserAction - non-null value, not last step field', async () => {
    const engine = new Engine({
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
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(0);
  });

  test('handleUserAction - non-null value, last step field, `submit` not `true`', async () => {
    const engine = new Engine({
      root: 'test',
      steps: { test: { fields: ['test'], nextStep: 'last' }, last: { fields: [] } },
      fields: { test: { type: 'Test' } },
    });
    await flushPromises();
    jest.clearAllMocks();
    (engine as Json).handleUserAction({
      type: 'input', value: 'test', fieldId: 'test', stepIndex: 0,
    });
    await flushPromises();
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(4);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test', label: undefined, message: null, options: {}, status: 'initial', tooltip: null, type: 'Test', value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, last step field, `submit` is `true`', async () => {
    const engine = new Engine({
      root: 'test',
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
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(2);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test', label: undefined, message: null, options: {}, status: 'initial', tooltip: null, type: 'Test', value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, last step field, nextStep is `null`', async () => {
    const engine = new Engine({
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
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(2);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test', label: undefined, message: null, options: {}, status: 'initial', tooltip: null, type: 'Test', value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, last step field, loaded next step is `null`', async () => {
    const engine = new Engine({
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
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(2);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test', label: undefined, message: null, options: {}, status: 'initial', tooltip: null, type: 'Test', value: undefined,
        }],
        id: 'test',
        status: 'initial',
      }],
    });
  });

  test('handleUserAction - non-null value, `nextStep` is a function', async () => {
    const engine = new Engine({
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
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(2);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('steps', 'SET', {
      steps: [{
        fields: [{
          id: 'test', label: undefined, message: null, options: {}, status: 'initial', tooltip: null, type: 'Test', value: undefined,
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
        api.on('loadNextStep', () => { consolelog(engine); });
      })],
    });
  });

  test('getConfiguration', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    expect(engine.getConfiguration()).toEqual(configuration);
    expect(engine.getConfiguration()).not.toBe(configuration);
  });

  test('generateField - field exists, non-interactive', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Message' } },
    };
    const engine = new Engine(configuration);
    expect(engine.generateField('test')).toEqual({
      id: 'test',
      label: undefined,
      message: null,
      options: {},
      status: 'success',
      tooltip: null,
      type: 'Message',
      value: undefined,
    });
  });

  test('generateField - field exists, interactive', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    expect(engine.generateField('test')).toEqual({
      id: 'test',
      label: undefined,
      message: null,
      options: {},
      status: 'initial',
      tooltip: null,
      type: 'Test',
      value: undefined,
    });
  });

  test('generateField - field does not exist', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    expect(() => engine.generateField('other')).toThrow(new Error('Field "other" does not exist.'));
  });

  test('generateStep - step exists', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    expect(engine.generateStep('test')).toEqual({
      id: 'test',
      status: 'initial',
      fields: [{
        id: 'test',
        label: undefined,
        message: null,
        options: {},
        status: 'initial',
        tooltip: null,
        type: 'Test',
        value: undefined,
      }],
    });
  });

  test('generateStep - step does not exist', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    expect(() => engine.generateStep('other')).toThrow(new Error('Step "other" does not exist.'));
  });

  test('loadValues', async () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    await flushPromises();
    jest.clearAllMocks();
    engine.loadValues({ test: 'test', other: 'other' });
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(1);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('userActions', 'ADD', {
      fieldId: 'test', stepIndex: 0, type: 'input', value: 'test',
    });
  });

  test('getStore', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    expect((engine as Json).store).toBe(engine.getStore());
  });

  test('getCurrentStep', async () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    process.env.DEEP_COPY = 'undefined';
    expect(engine.getCurrentStep()).toBeNull();
    delete process.env.DEEP_COPY;
    await flushPromises();
    expect(engine.getCurrentStep()).toEqual((engine as Json).generatedSteps[0]);
    expect(engine.getCurrentStep()).not.toBe((engine as Json).generatedSteps[0]);
  });

  test('updateCurrentStep - no notification', async () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    await flushPromises();
    jest.clearAllMocks();
    engine.updateCurrentStep({
      id: 'test',
      status: 'initial',
      fields: [],
    });
    expect((engine as Json).store.mutate).not.toHaveBeenCalled();
  });

  test('on', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test', 'last'] } },
      fields: { test: { type: 'Test' }, last: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    engine.on('submit', (data, next) => next(data));
    expect((engine as Json).hooks).toEqual({
      error: [],
      loadNextStep: [],
      loadedNextStep: [],
      submit: [expect.any(Function)],
      userAction: [],
    });
  });

  test('displayStepLoader', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    engine.displayStepLoader();
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(1);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('steps', 'SET_LOADER', { loadingNextStep: true });
  });

  test('hideStepLoader', () => {
    const configuration = {
      root: 'test',
      steps: { test: { fields: ['test'] } },
      fields: { test: { type: 'Test' } },
    };
    const engine = new Engine(configuration);
    engine.hideStepLoader();
    expect((engine as Json).store.mutate).toHaveBeenCalledTimes(1);
    expect((engine as Json).store.mutate).toHaveBeenCalledWith('steps', 'SET_LOADER', { loadingNextStep: false });
  });
});
