/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';
import errorHandler from 'scripts/core/errorHandler';
import MockedEngine from 'scripts/core/__mocks__/Engine';

jest.mock('scripts/core/Engine');
console.error = jest.fn(); // eslint-disable-line no-console

describe('core/errorHandler', () => {
  let engine = MockedEngine();

  beforeEach(() => {
    jest.clearAllMocks();
    engine = MockedEngine();
  });

  test('logs errors', () => {
    const { error } = console;
    errorHandler()(engine as unknown as Engine);
    engine.trigger('error', 'test');
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('test');
  });
});
