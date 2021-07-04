/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';
import MockedEngine from 'scripts/core/__mocks__/Engine';
import submittingFieldsManager from 'scripts/plugins/submittingFieldsManager';

describe('plugins/submittingFieldsManager', () => {
  let engine = MockedEngine();

  beforeEach(() => {
    jest.clearAllMocks();
    engine = MockedEngine();
    submittingFieldsManager()(engine as unknown as Engine);
  });

  test('userAction hook - null userAction', async () => {
    await engine.trigger('userAction', null);
    expect(engine.setCurrentStep).not.toHaveBeenCalled();
  });

  test('userAction hook - non-null userAction, invalid input', async () => {
    const userAction = { type: 'input', fieldId: 'test', value: 'test ' };
    await engine.trigger('userAction', userAction);
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      fields: [
        { id: 'test', type: 'Message', value: [] },
        {
          id: 'new', type: 'Message', value: 'ok', options: { modifiers: ' disabled' },
        },
        { id: 'other', type: 'Message' },
        {
          id: 'last',
          options: { modifiers: 'test disabled' },
          type: 'Message',
          value: 'last',
        },
      ],
    });
  });

  test('userAction hook - non-null userAction, valid input', async () => {
    const userAction = { type: 'input', fieldId: 'new', value: 'other' };
    process.env.ALL_FIELDS_VALID = 'true';
    await engine.trigger('userAction', userAction);
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      status: 'success',
      fields: [
        {
          id: 'test',
          type: 'Message',
          value: 'test',
          options: {
            modifiers: '',
          },
        },
      ],
    });
    delete process.env.ALL_FIELDS_VALID;
  });

  test('loadNextStep hook - null nextStep', async () => {
    process.env.ENGINE_NULL_CURRENT_STEP = 'true';
    await engine.trigger('loadNextStep', null);
    expect(engine.setCurrentStep).not.toHaveBeenCalled();
    delete process.env.ENGINE_NULL_CURRENT_STEP;
  });

  test('loadNextStep hook - non-null nextStep', async () => {
    await engine.trigger('loadNextStep', null);
    expect(engine.setCurrentStep).toHaveBeenCalledTimes(2);
    expect(engine.setCurrentStep).toHaveBeenNthCalledWith(1, {
      fields: [{ id: 'test', type: 'Message', value: [] }, {
        id: 'new', options: { modifiers: ' disabled loading' }, type: 'Message', value: 'ok',
      }, { id: 'other', type: 'Message' }, {
        id: 'last', options: { modifiers: 'test disabled loading' }, type: 'Message', value: 'last',
      }],
    }, true);
    expect(engine.setCurrentStep).toHaveBeenNthCalledWith(2, {
      fields: [{ id: 'test', type: 'Message', value: [] }, {
        id: 'new', options: { modifiers: '' }, type: 'Message', value: 'ok',
      }, { id: 'other', type: 'Message' }, {
        id: 'last', options: { modifiers: 'test' }, type: 'Message', value: 'last',
      }],
    });
  });

  test('submit hook - no error', async () => {
    await engine.trigger('submit', {}, {});
    expect(engine.setCurrentStep).toHaveBeenCalledTimes(1);
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      fields: [{ id: 'test', type: 'Message', value: [] }, {
        id: 'new', options: { modifiers: ' disabled loading' }, type: 'Message', value: 'ok',
      }, { id: 'other', type: 'Message' }, {
        id: 'last', options: { modifiers: 'test disabled loading' }, type: 'Message', value: 'last',
      }],
    }, true);
  });

  test('submit hook - error', async () => {
    await engine.trigger('submit', {}, null);
    expect(engine.setCurrentStep).toHaveBeenCalledTimes(2);
    expect(engine.setCurrentStep).toHaveBeenNthCalledWith(1, {
      fields: [{ id: 'test', type: 'Message', value: [] }, {
        id: 'new', options: { modifiers: ' disabled loading' }, type: 'Message', value: 'ok',
      }, { id: 'other', type: 'Message' }, {
        id: 'last', options: { modifiers: 'test disabled loading' }, type: 'Message', value: 'last',
      }],
    }, true);
    expect(engine.setCurrentStep).toHaveBeenNthCalledWith(2, {
      fields: [{ id: 'test', type: 'Message', value: [] }, {
        id: 'new', options: { modifiers: '' }, type: 'Message', value: 'ok',
      }, { id: 'other', type: 'Message' }, {
        id: 'last', options: { modifiers: 'test' }, type: 'Message', value: 'last',
      }],
    });
  });
});
