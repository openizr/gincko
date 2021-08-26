/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Configuration } from 'scripts/propTypes/configuration';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Engine mock.
 */
export default jest.fn((configuration = {}) => {
  const hooks: { [eventName: string]: ((...args: Any[]) => Any)[]; } = {
    start: [],
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
    setValues: jest.fn(),
    userAction: jest.fn(),
    loadNextStep: jest.fn(),
    handleSubmit: jest.fn(),
    triggerHooks: jest.fn(),
    createStep: jest.fn((stepId) => ((stepId === 'invalid')
      ? null
      : { id: stepId, fields: [] })),
    createField: jest.fn(),
    getConfiguration: jest.fn(() => ({
      root: '',
      steps: {},
      autoFill: configuration.autoFill !== false,
      fields: {
        test: {
          type: 'Test',
          value: 'first',
        },
        new: {
          type: 'Test',
          loadNextStep: true,
          messages: {
            validation: (value: string) => ((value !== 'new') ? 'invalid' : null),
          },
        },
        other: {
          type: 'Test',
          required: true,
          messages: {
            validation: (value: string) => ((value !== 'other') ? 'invalid' : null),
          },
        },
        last: {
          required: true,
          type: 'Test',
          value: null,
        },
      },
    } as Configuration)),
    getValues: jest.fn(() => ({ test: 'value' })),
    getFieldIndex: jest.fn(() => ((process.env.LAST_FIELD === 'true') ? 3 : 0)),
    handleUserAction: jest.fn(),
    toggleStepLoader: jest.fn(),
    setCurrentStep: jest.fn(),
    updateGeneratedSteps: jest.fn(),
    getCurrentStepIndex: jest.fn(() => 0),
    getCurrentStep: jest.fn(() => {
      if (process.env.ALL_FIELDS_VALID === 'true') {
        return {
          status: 'success',
          fields: [
            {
              id: 'test',
              type: 'Message',
              value: 'test',
            },
          ],
        };
      }
      if (process.env.ENGINE_NULL_CURRENT_STEP === 'true') {
        return null;
      }
      return {
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
            options: {
              modifiers: 'test',
            },
          },
        ],
      };
    }),
    on: jest.fn((event: string, callback: () => Any) => {
      hooks[event].push(callback);
    }),
    trigger: (event: string, data: Any, nextData?: Any): Any => (
      Promise.all(hooks[event].map((hook) => hook(data, (updatedData: Any) => {
        next(updatedData);
        return Promise.resolve(nextData);
      })))
    ),
  });
});
