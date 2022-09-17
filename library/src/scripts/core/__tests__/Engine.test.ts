/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import cache from 'scripts/core/__mocks__/cache';
import Engine from 'scripts/core/__mocks__/TestEngine';
import configuration from 'scripts/core/__mocks__/configuration';

vi.mock('diox');
vi.mock('basx');
vi.mock('scripts/core/deepFreeze');

// This trick allows to check the calling order of the different plugins.
const call = vi.fn();

async function flushPromises(): Promise<void> {
  const promise = new Promise<void>((resolve) => { setTimeout(resolve, 50); });
  return promise;
}

describe('core/Engine', () => {
  let engine: Engine;

  async function createEngine(conf: Configuration = configuration, flush = true): Promise<Engine> {
    engine = new Engine(conf);
    if (flush) {
      await flushPromises();
      vi.clearAllMocks();
    }
    return engine;
  }

  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.CACHE_EXISTS;
    delete process.env.CACHE_EXISTS_2;
  });

  describe('triggerHooks', () => {
    test('error', async () => {
      try {
        await createEngine({
          ...configuration,
          plugins: [(api): void => {
            api.on('userAction', (data, next) => (data !== null
              ? next(undefined as unknown as UserAction)
              : next(data)));
          }],
        });
        await engine.triggerHooks('userAction', {});
      } catch (error) {
        expect(error).toEqual(new Error(
          'Event "userAction": data passed to the next hook is "undefined". This usually means that'
          + ' you did not correctly resolved your hook\'s Promise with proper data.',
        ));
      }
    });

    test('error with errors hook', async () => {
      const hook = vi.fn((data, next) => next(data));
      await createEngine({
        ...configuration,
        plugins: [(api): void => {
          // Covers `getInputs` constructor declaration.
          api.getInputs();
          api.on('userAction', (data, next) => (data !== null
            ? next(undefined as unknown as UserAction)
            : next(data)));
          api.on('error', hook);
        }],
      });
      expect(await engine.triggerHooks('userAction', {})).toBe(null);
      expect(hook).toHaveBeenCalledTimes(1);
      expect(hook).toHaveBeenCalledWith(new Error(
        'Event "userAction": data passed to the next hook is "undefined". This usually means that'
        + ' you did not correctly resolved your hook\'s Promise with proper data.',
      ), expect.any(Function));
    });
  });

  describe('constructor', () => {
    test('default plugins values and a custom plugin', async () => {
      await createEngine({
        ...configuration,
        plugins: [vi.fn(() => call('customPlugin'))],
      }, false);
      expect(call).toHaveBeenCalledTimes(1);
      expect(call).toHaveBeenCalledWith('customPlugin');
    });

    test('`start` hook returns `null`', async () => {
      await createEngine({
        ...configuration,
        plugins: [(api): void => {
          api.on('start', (_data, next) => next(null));
        }],
      });
      expect(engine.getCurrentStep()).toBe(null);
    });

    test('cache is enabled, cache exists', async () => {
      process.env.CACHE_EXISTS = 'true';
      await createEngine({ ...configuration, cache }, false);
      await flushPromises();
      expect(engine.getCurrentStep()).toMatchSnapshot();
      expect(engine.getInputs()).toEqual({ test: 'value' });
    });

    test('cache is enabled, cache exists, `autoFill` is `false`', async () => {
      process.env.CACHE_EXISTS = 'true';
      await createEngine({ ...configuration, cache, autoFill: false }, false);
      await flushPromises();
      expect(engine.getInputs()).toEqual({});
      expect(engine.getCurrentStep()).toMatchSnapshot();
    });

    test('cache exists, `useCache` is `true`, `restartOnReload` is `true`', async () => {
      process.env.CACHE_EXISTS = 'true';
      await createEngine({ ...configuration, cache, restartOnReload: true }, false);
      await flushPromises();
      expect(engine.getCurrentStep()).toMatchSnapshot();
    });
  });

  test('toggleLoader', async () => {
    vi.useFakeTimers();
    const promise = createEngine();
    vi.runAllTimers();
    await promise;
    vi.clearAllMocks();
    engine.toggleLoader(true);
    vi.runAllTimers();
    expect(engine.getStore().mutate).toHaveBeenCalledTimes(1);
    expect(engine.getStore().mutate).toHaveBeenCalledWith('state', 'UPDATE', {
      loading: true,
      steps: [],
      userInputs: {},
      variables: {},
    });
  });

  test('on', async () => {
    await createEngine();
    const hook1 = vi.fn((_data, next) => next(null));
    const hook2 = vi.fn((data, next) => next(data));
    engine.on('submit', hook1);
    engine.on('submit', hook2);
    await engine.triggerHooks('submit', { test: 'value' });
    expect(hook1).toHaveBeenCalledTimes(1);
    expect(hook1).toHaveBeenCalledWith({ test: 'value' }, expect.any(Function));
    expect(hook2).toHaveBeenCalledTimes(1);
    expect(hook2).toHaveBeenCalledWith(null, expect.any(Function));
  });

  test('deepCompare', async () => {
    await createEngine();
    const field: Field = {
      id: 'field1',
      value: 'test',
      component: 'Null',
      status: 'initial',
      componentProps: {},
    };
    let fieldConfiguration: FieldConfiguration = { type: 'string', component: 'Null' };
    expect(engine.deepCompare(field, 'test2', fieldConfiguration, 'root.0.field1')).toMatchSnapshot();
    expect(field).toMatchSnapshot();
    field.fieldIds = ['0', '1', '2', '3'];
    field.fields = [{
      id: '0',
      value: { key: 'test0' },
      component: 'Null',
      status: 'success',
      componentProps: {},
      fields: [{
        id: 'key',
        component: 'Null',
        status: 'success',
        componentProps: {},
        value: 'test0',
      }, {
        id: 'key2',
        component: 'Null',
        status: 'initial',
        componentProps: {},
        value: new Date(1657192371401),
      }],
    }, {
      id: '1',
      value: { key: 'test1' },
      component: 'Null',
      status: 'success',
      componentProps: {},
      fields: [{
        id: 'key',
        component: 'Null',
        status: 'success',
        componentProps: {},
        value: 'test1',
      }],
    }, {
      id: '2',
      value: { key: 'test2' },
      component: 'Null',
      status: 'success',
      componentProps: {},
      fields: [{
        id: 'key',
        component: 'Null',
        status: 'success',
        componentProps: {},
        value: 'test2',
      }, {
        id: 'key2',
        component: 'Null',
        status: 'initial',
        componentProps: {},
        value: null,
      }, {
        id: 'key3',
        component: 'Null',
        status: 'initial',
        componentProps: {},
        value: { __: 'test2' },
        fields: [{
          id: '__',
          component: 'Null',
          status: 'initial',
          componentProps: {},
          value: 'test2',
        }],
      }],
    }, {
      id: '3',
      value: { key: 'test3' },
      component: 'Null',
      status: 'success',
      componentProps: {},
      fields: [{
        id: 'key',
        component: 'Null',
        status: 'success',
        componentProps: {},
        value: 'test3',
      }, {
        id: 'key2',
        component: 'Null',
        status: 'initial',
        componentProps: {},
        value: null,
      }, {
        id: 'key3',
        component: 'Null',
        status: 'initial',
        componentProps: {},
        value: { __: 'test3' },
        fields: [{
          id: '__',
          component: 'Null',
          status: 'initial',
          componentProps: {},
          value: 'test3',
        }],
      }],
    }];
    field.value = [
      { key: 'test0', key2: new Date(1657192371401) },
      { key: 'test1', key3: { __: 'test2' } },
      { key: 'test2', key3: { __: 'test3' } },
    ];
    fieldConfiguration = {
      type: 'array',
      component: 'Null',
      fields: {
        type: 'object',
        component: 'Null',
        fields: {
          key: {
            type: 'string',
            component: 'Null',
          },
          key2: {
            type: 'date',
            component: 'Null',
          },
          key3: {
            type: 'dynamicObject',
            component: 'Null',
            fields: {
              __: { type: 'string', component: 'null' },
            },
          },
        },
      },
    };
    expect(engine.deepCompare(field, [
      { key: 'test0', key2: new Date(1657192371401) },
      null,
      { key: 'new2', key2: new Date(1657192371401) },
      { key: 'test3', key3: { __: 'ok' } },
    ], fieldConfiguration, 'root.0.field1')).toMatchSnapshot();
    expect(field).toMatchSnapshot();
  });

  test('userAction', async () => {
    await createEngine();
    const userAction = { path: 'path.to.field', data: 1, type: 'input' };
    engine.userAction(userAction);
    expect(engine.getStore().mutate).toHaveBeenCalledTimes(1);
    expect(engine.getStore().mutate).toHaveBeenCalledWith('userActions', 'ADD', userAction);
  });

  test('coerceAndCheckInput', async () => {
    const errorHook = vi.fn(async () => null);
    await createEngine({ ...configuration, plugins: [(api): void => { api.on('error', errorHook); }] });
    expect(await engine.coerceAndCheckInput('', 'string')).toBe('');
    expect(await engine.coerceAndCheckInput('3.0', 'float')).toBe(3.0);
    expect(await engine.coerceAndCheckInput('_3_0', 'float')).toBe(null);
    expect(await engine.coerceAndCheckInput('3', 'integer')).toBe(3);
    expect(await engine.coerceAndCheckInput('_3', 'integer')).toBe(null);
    expect(await engine.coerceAndCheckInput('2022-07-14T16:47:19.253Z', 'date')).toBeInstanceOf(Date);
    await engine.coerceAndCheckInput('', 'array');
    await engine.coerceAndCheckInput('', 'object');
    await engine.coerceAndCheckInput('', 'dynamicObject');
    expect(errorHook).toHaveBeenNthCalledWith(1, new Error('Invalid input type for array.'), expect.any(Function));
    expect(errorHook).toHaveBeenNthCalledWith(2, new Error('Invalid input type for object.'), expect.any(Function));
    expect(errorHook).toHaveBeenNthCalledWith(3, new Error('Invalid input type for dynamicObject.'), expect.any(Function));
  });

  test('areEqual', async () => {
    await createEngine();
    const date1 = new Date(1657816419059);
    const date2 = new Date(1657816419059);
    const binary1 = { size: 1982, name: 'test.png' };
    const binary2 = { size: 1982, name: 'test.png' };
    expect(engine.areEqual(1.0, 1.0, 'float')).toBe(true);
    expect(engine.areEqual(1.2, 1.0, 'float')).toBe(false);
    expect(engine.areEqual(NaN, NaN, 'float')).toBe(true);
    expect(engine.areEqual(date1, date2, 'date')).toBe(true);
    expect(engine.areEqual(NaN, NaN, 'integer')).toBe(true);
    expect(engine.areEqual(binary1, binary2, 'binary')).toBe(true);
  });

  test('handleUserAction', async () => {
    await createEngine();
    await engine.handleUserAction({ path: 'path.to.field', data: 1, type: 'input' });
    await engine.handleUserAction({ path: 'root.0.submit', data: [false], type: 'input' });
    await engine.handleUserAction({ path: 'root.0.submit', data: [true], type: 'input' });
    expect(engine.getSteps()).toMatchSnapshot();
    await createEngine({
      ...configuration,
      plugins: [(api): void => {
        api.on('afterUserAction', async (userAction) => {
          (<Step>engine.getCurrentStep()).status = 'success';
          return userAction;
        });
      }],
    });
    await engine.handleUserAction({ path: 'root.0.submit', data: [false], type: 'input' });
    const spy = vi.spyOn(engine, 'toggleField');
    await engine.handleUserAction({ path: 'root.0.submit', data: [true], type: 'input' });
    expect(engine.getSteps()).toMatchSnapshot();
    expect(spy).toHaveBeenCalledWith('second.1.submit', [{
      component: 'Button',
      componentProps: {},
      id: 'submit',
      label: undefined,
      status: 'initial',
      value: [
        true,
      ],
    }], 0, { component: 'Button', type: 'boolean' }, [true]);
  });

  test('submit - clear cache', async () => {
    const hook = vi.fn((data, next) => next(data));
    await createEngine({
      ...configuration,
      plugins: [(api): void => { api.on('submit', hook); }],
    });
    await engine.handleSubmit();
    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith({}, expect.any(Function));
    // Covers `nextStep` as a primitive value.
    await createEngine({
      ...configuration,
      steps: { root: { fields: {} } },
    });
    await engine.handleSubmit();
  });

  test('getInputs', async () => {
    await createEngine();
    engine.setInput('root.0.nestedArray.0.0', undefined);
    engine.setInput('root.0.stringCondition', undefined);
    engine.setInput('root.0.nestedArray.0.0', 'BONJOUR');
    engine.setInput('root.0.nestedArray.0.1', 'SALUT');
    engine.setInput('root.0.nestedObject.object.string', 'HOLA');
    expect(engine.getInputs()).toEqual({
      nestedArray: [[
        'BONJOUR',
        'SALUT',
      ]],
      nestedObject: {
        object: {
          string: 'HOLA',
        },
      },
    });
    expect(engine.getInputs('root.0.nestedObject.object')).toEqual({ string: 'HOLA' });
    expect(engine.getInputs('root.0.nestedArray')).toEqual([['BONJOUR', 'SALUT']]);
    expect(engine.getInputs('root.0.nestedArray.0.1')).toBe('SALUT');
    expect(engine.getInputs('other.12.unexisting.0.1')).toBe(null);
  });

  test('withoutFunctions', async () => {
    await createEngine();
    expect(engine.withoutFunctions([{
      id: 'object',
      status: 'initial',
      component: 'Null',
      componentProps: { onClick: [vi.fn()] },
      fields: [{
        id: 'dynamicObject',
        status: 'initial',
        component: 'Null',
        componentProps: { key: true, onFocus: vi.fn() },
        fields: [{
          id: '__',
          status: 'initial',
          component: 'Null',
          componentProps: {},
          fields: [{
            id: '0',
            status: 'initial',
            component: 'Null',
            componentProps: { props: { onBlur: vi.fn() } },
          }],
        }, {
          id: '000',
          status: 'initial',
          component: 'Null',
          componentProps: {},
        }, null],
      }],
    }, null] as unknown as Step[])).toMatchSnapshot();
  });

  test('withFunctions', async () => {
    await createEngine();
    expect(engine.withFunctions([{
      id: 'object',
      status: 'initial',
      component: 'Null',
      componentProps: {},
      fields: [{
        id: 'dynamicObject',
        status: 'initial',
        component: 'Null',
        componentProps: { key: true },
        fields: [{
          id: '__',
          status: 'initial',
          component: 'Null',
          componentProps: {},
          fields: [{
            id: '0',
            status: 'initial',
            component: 'Null',
            componentProps: {},
          }],
        }, {
          id: '000',
          status: 'initial',
          component: 'Null',
          componentProps: {},
        }, null],
      }],
    }, null], {
      object: {
        type: 'object',
        component: 'Null',
        fields: {
          dynamicObject: {
            type: 'dynamicObject',
            component: 'Null',
            fields: {
              __: {
                type: 'array',
                component: 'Null',
                fields: {
                  type: 'string',
                  component: 'Null',
                  componentProps: { props: { onBlur: vi.fn() } },
                },
              },
            },
            componentProps: { onFocus: vi.fn() },
          },
        },
        componentProps: { onClick: vi.fn() },
      },
    })).toMatchSnapshot();
  });

  test('toggleFields', async () => {
    await createEngine();
    engine.toggleFields(null);
    const currentStep = <Step>engine.getCurrentStep();
    expect(currentStep).toMatchSnapshot();
    engine.setInput('root.0.nestedObject.object.string', 'HOLA');
    engine.toggleFields(currentStep);
    expect(currentStep).toMatchSnapshot();
    currentStep.fields?.[2]?.fields?.splice(0, 0, null);
    engine.toggleFields(currentStep);
    expect(currentStep).toMatchSnapshot();
    currentStep.fields?.[7]?.fields?.splice(0, 0, null);
    engine.toggleFields(currentStep);
    engine.setInput('root.0.nestedDynamicObject', {});
    engine.toggleFields(currentStep);
    expect(currentStep).toMatchSnapshot();
  });

  test('filterInputs', async () => {
    await createEngine();
    const field: Field = {
      id: 'test',
      value: 'test',
      status: 'initial',
      component: 'Null',
      componentProps: {},
    };
    const filteredInputs = {};
    let fieldConfiguration: FieldConfiguration = { type: 'null', component: 'Null' };
    engine.filterInputs(true, field, fieldConfiguration, 'test', filteredInputs);
    expect(filteredInputs).toEqual({});
    engine.filterInputs(true, field, fieldConfiguration, undefined, filteredInputs);
    expect(filteredInputs).toEqual({ test: 'test' });
    fieldConfiguration = { type: 'array', component: 'Null', fields: { type: 'string', component: 'Null' } };
    field.value = ['test'];
    field.fields = [{
      id: '0',
      value: 'test',
      status: 'initial',
      component: 'Null',
      componentProps: {},
    }];
    engine.filterInputs(false, field, fieldConfiguration, undefined, filteredInputs);
    engine.filterInputs(false, field, fieldConfiguration, [], filteredInputs);
    fieldConfiguration = { type: 'object', component: 'Null', fields: { 0: { type: 'string', component: 'Null' } } };
    engine.filterInputs(false, field, fieldConfiguration, undefined, filteredInputs);
    engine.filterInputs(false, field, fieldConfiguration, {}, filteredInputs);
    fieldConfiguration = { type: 'dynamicObject', component: 'Null', fields: { 0: { type: 'string', component: 'Null' } } };
    engine.filterInputs(false, field, fieldConfiguration, {}, filteredInputs);
    field.fields = [null];
    engine.filterInputs(false, field, fieldConfiguration, {}, filteredInputs);
    fieldConfiguration = { type: 'object', component: 'Null', fields: { 0: { type: 'string', component: 'Null' } } };
    engine.filterInputs(false, field, fieldConfiguration, {}, filteredInputs);
    expect(filteredInputs).toEqual({ test: { 0: 'test' } });
  });

  test('validateFields', async () => {
    await createEngine();
    const currentStep = <Step>engine.getCurrentStep();
    engine.validateFields();
    expect(currentStep).toMatchSnapshot();
    (<Field>currentStep.fields[6]).value = { object: {} };
    engine.validateFields(true);
    expect(currentStep).toMatchSnapshot();
    delete (<Field>currentStep.fields[6]).value;
    (<Field>currentStep.fields[1]).value = 'ok';
    (<Field>currentStep.fields[2]).value = [];
    (<Field>currentStep.fields[2]).fieldIds = [0, 1, 2];
    for (let i = 0; i < 3; i += 1) {
      (<unknown[]>(<Field>currentStep.fields[2]).value).push(['valid', 'invalid']);
      (<Field>currentStep.fields[2]).fields?.push({
        id: `${i}`,
        status: 'initial',
        component: 'Null',
        value: ['valid', 'invalid'],
        componentProps: {},
        fieldIds: [0, 1],
        fields: [
          {
            id: '0',
            status: 'initial',
            value: 'valid',
            component: 'Null',
            componentProps: {},
          },
          {
            id: '1',
            status: 'initial',
            value: 'invalid',
            component: 'Null',
            componentProps: {},
          },
        ],
      });
    }
    (<Field>currentStep.fields[7]).value = { invalid01: 3 };
    (<Field>currentStep.fields[7]).fieldIds = ['invalid01'];
    (<Field>currentStep.fields[7]).fields?.push({
      id: 'invalid01',
      status: 'initial',
      component: 'Null',
      componentProps: {},
      fieldIds: ['integer'],
      fields: [{
        id: 'integer',
        status: 'initial',
        value: 3,
        component: 'Null',
        componentProps: {},
      }],
    });
    engine.validateFields();
    expect(currentStep).toMatchSnapshot();
    for (let i = 0; i < 3; i += 1) {
      (<Field[]>(<Field[]>(<Field>currentStep.fields[2]).fields)[i].fields)[1].value = 'valid';
    }
    (<Field>currentStep.fields[7]).fieldIds = ['test'];
    (<Field>currentStep.fields[7]).fields?.splice(0, 1, {
      id: 'test',
      status: 'initial',
      component: 'Null',
      componentProps: {},
      fieldIds: ['string'],
      fields: [{
        id: 'string',
        status: 'initial',
        component: 'Null',
        componentProps: {},
      }],
    });
    engine.validateFields();
    expect(currentStep).toMatchSnapshot();
  });

  test('getConfiguration', async () => {
    await createEngine();
    expect(engine.getConfiguration()).toMatchSnapshot();
    expect(engine.getConfiguration('wrong.path.0')).toBe(null);
    expect(engine.getConfiguration('root.0.wrong.path')).toBe(null);
    expect(engine.getConfiguration('root.0.nestedArray.0')).toMatchSnapshot();
    expect(engine.getConfiguration('root.0.nestedDynamicObject.***')).toBe(null);
    expect(engine.getConfiguration('root.0.nestedObject.object.wrong.path')).toBe(null);
    expect(engine.getConfiguration('root.0.nestedDynamicObject.123')).toMatchSnapshot();
    expect(engine.getConfiguration('root.0.nestedDynamicObject.string')).toMatchSnapshot();
  });

  test('getField', async () => {
    await createEngine();
    const currentStep = <Step>engine.getCurrentStep();
    engine.toggleFields(currentStep);
    (<Field>currentStep.fields[7]).fieldIds = ['123', 'test'];
    (<Field>currentStep.fields[7]).fields = [{
      id: '123',
      status: 'initial',
      component: 'Null',
      componentProps: {},
      fieldIds: ['integer'],
      fields: [{
        id: 'integer',
        status: 'initial',
        component: 'Null',
        componentProps: {},
      }],
    }, {
      id: 'test',
      status: 'initial',
      component: 'Null',
      componentProps: {},
      fieldIds: ['string'],
      fields: [{
        id: 'string',
        status: 'initial',
        component: 'Null',
        componentProps: {},
      }],
    }];
    expect(engine.getField('wrong.0')).toBe(null);
    expect(engine.getField('wrong.path.0')).toBe(null);
    expect(engine.getField('root.0.wrong')).toBe(null);
    expect(engine.getField('root.0.submit')).toMatchSnapshot();
    expect(engine.getField('root.0.nestedArray.0')).toMatchSnapshot();
    expect(engine.getField('root.0.nestedDynamicObject.123')).toMatchSnapshot();
    expect(engine.getField('root.0.nestedDynamicObject.test')).toMatchSnapshot();
  });

  test('getSteps', async () => {
    await createEngine();
    expect(engine.getSteps()).toMatchSnapshot();
  });

  test('setVariables', async () => {
    process.env.CACHE_EXISTS_2 = 'true';
    vi.useFakeTimers();
    const promise = createEngine({ ...configuration, cache });
    vi.runAllTimers();
    await promise;
    engine.setInput('root.0.integerCondition', 3);
    const currentStep = <Step>engine.getCurrentStep();
    engine.toggleFields(currentStep);
    (<Field>currentStep.fields[4]).value = 'test';
    engine.setVariables({ newTest: true, nested: { test: 'ok' } });
    vi.runAllTimers();
    expect(engine.getVariables()).toMatchSnapshot();
    expect(cache.set).toHaveBeenCalledTimes(1);
    expect(cache.set.mock.lastCall).toMatchSnapshot();
    vi.useRealTimers();
    expect(engine.getCurrentStep()).toMatchSnapshot();
    engine.setVariables({ newTest: true, nested: { test: 'test' } });
    expect(engine.getCurrentStep()).toMatchSnapshot();
  });

  test('clearCache', async () => {
    await createEngine({ ...configuration });
    await engine.clearCache();
    expect(cache.delete).toHaveBeenCalledTimes(0);
    await createEngine({ ...configuration, cache });
    await engine.clearCache();
    expect(cache.delete).toHaveBeenCalledTimes(1);
    expect(cache.delete).toHaveBeenCalledWith('gincko_cache');
  });
});
