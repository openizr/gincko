/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/__mocks__/Engine';
import errorHandler from 'scripts/plugins/errorHandler';

console.error = jest.fn(); // eslint-disable-line no-console

let engine = Engine();

describe('plugins/errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    engine = Engine();
  });

  test('logs errors', () => {
    errorHandler()(engine);
    engine.trigger('error', 'test');
    expect(console.error).toHaveBeenCalledTimes(1); // eslint-disable-line no-console
    expect(console.error).toHaveBeenCalledWith('test'); // eslint-disable-line no-console
  });
});
