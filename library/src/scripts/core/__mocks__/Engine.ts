/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Engine mock.
 */
export default jest.fn((): Json => {
  const hooks: { [key: string]: Json[] } = {
    error: [],
    submit: [],
    userAction: [],
    loadNextStep: [],
    loadedNextStep: [],
  };

  const next = jest.fn();

  return ({
    next,
    getStore: jest.fn(() => ({
      subscribe: jest.fn((_name, callback) => callback({
        steps: [{ id: 'start' }, { id: 'end' }],
        loadingNextStep: process.env.LOADING === 'true',
      })),
      unsubscribe: jest.fn(),
      mutate: jest.fn(),
    })),
    loadValues: jest.fn(),
    loadNextStep: jest.fn(),
    handleSubmit: jest.fn(),
    triggerHooks: jest.fn(),
    createStep: jest.fn(),
    createField: jest.fn(),
    getConfiguration: jest.fn(() => ({
      steps: {},
      fields: {
        test: {
          type: 'Test',
          value: 'first',
          transform: (): string => 'transformedValue',
        },
        new: {
          type: 'Test',
          validation: (value: string): boolean => value === 'new',
          transform: (): string => 'transformedValue',
        },
        other: {
          type: 'Test',
          required: true,
          validation: (value: string): boolean => value === 'other',
          transform: (): string => 'transformedValue',
        },
        last: {
          required: true,
          type: 'Test',
          value: null,
        },
      },
    })),
    getValues: jest.fn(() => ({ test: 'value' })),
    getFieldIndex: jest.fn(() => ((process.env.LAST_FIELD === 'true') ? 3 : 0)),
    handleUserAction: jest.fn(),
    toggleStepLoader: jest.fn(),
    setCurrentStep: jest.fn(),
    updateGeneratedSteps: jest.fn(),
    getCurrentStep: jest.fn(() => ((process.env.ALL_FIELDS_VALID === 'true')
      ? ({
        fields: [
          {
            id: 'test',
            type: 'Message',
            value: 'test',
          },
        ],
      })
      : ({
        fields: [
          {
            id: 'test',
            type: 'Message',
            value: [],
          },
          {
            id: 'new',
            type: 'Message',
            value: 'ok',
          },
          {
            id: 'other',
            type: 'Message',
          },
          {
            id: 'last',
            type: 'Message',
            value: 'last',
          },
        ],
      }))),
    on: jest.fn((event: string, callback: Json) => {
      hooks[event].push(callback);
    }),
    trigger: (event: string, data: Json, nextData?: Json): Json => (
      Promise.all(hooks[event].map((hook) => hook(data, (updatedData: Json) => {
        next(updatedData);
        return Promise.resolve(nextData);
      })))
    ),
  });
});
