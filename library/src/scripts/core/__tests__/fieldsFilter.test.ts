/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';
import fieldsFilter from 'scripts/core/fieldsFilter';
import MockedEngine from 'scripts/core/__mocks__/Engine';

describe('core/fieldsFilter', () => {
  let engine = MockedEngine();

  beforeEach(() => {
    jest.clearAllMocks();
    engine = MockedEngine();
    fieldsFilter()(engine as unknown as Engine);
    delete process.env.FIELD_NOT_FOUND;
    delete process.env.ENGINE_NULL_CURRENT_STEP;
  });

  test('userAction hook - null user action', async () => {
    const [userAction] = await engine.trigger('userAction', null, null);
    expect(userAction).toBeNull();
  });

  test('userAction hook - null curent step', async () => {
    process.env.ENGINE_NULL_CURRENT_STEP = 'true';
    const [userAction] = await engine.trigger('userAction', {}, null);
    expect(userAction).toBeNull();
  });

  test('userAction hook - valid user action, field does not exist', async () => {
    process.env.FIELD_NOT_FOUND = 'true';
    await engine.trigger('userAction', {});
    expect(engine.userAction).toHaveBeenCalledWith({ fieldId: 'last', value: 'test' });
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      id: 'test',
      fields: [{ id: 'other', type: 'Input' }, { id: 'last', type: 'Input', value: 'test' }],
    });
  });

  test('userAction hook - valid user action, fields exist', async () => {
    await engine.trigger('userAction', {});
    expect(engine.userAction).not.toHaveBeenCalled();
    expect(engine.setCurrentStep).toHaveBeenCalledWith({
      id: 'test',
      fields: [{ id: 'test', type: 'Message', value: [] }, { id: 'test', type: 'Message', value: [] }],
    });
  });

  test('loadNextStep hook - null next step', async () => {
    const [nextStep] = await engine.trigger('loadNextStep', null, null);
    expect(nextStep).toBeNull();
  });

  test('loadNextStep hook - non-null next step', async () => {
    const nextStep = { id: 'test', fields: [{ id: 'test' }, { id: 'unknown', value: 'value' }] };
    const [updatedNextStep] = await engine.trigger('loadNextStep', nextStep, nextStep);
    expect(updatedNextStep).toEqual({ fields: [{ id: 'unknown', value: 'value' }], id: 'test' });
  });
});
