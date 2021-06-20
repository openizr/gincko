/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/__mocks__/Engine';
import reCaptchaHandler from 'scripts/plugins/reCaptchaHandler';

let engine = Engine();

describe('plugins/reCaptchaHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    engine = Engine();
  });

  test('initialization - custom options', () => {
    reCaptchaHandler({ enabled: false })(engine);
    expect(engine.on).not.toHaveBeenCalled();
  });

  test('submit hook - reCAPTCHA client not loaded', async () => {
    const element = { onload: jest.fn() };
    const unmockedCreateElement = document.createElement;
    const unmockedGetElementsByTagName = document.getElementsByTagName;
    (document as Json).createElement = jest.fn(() => element);
    (document as Json).getElementsByTagName = jest.fn(() => [{
      appendChild: jest.fn(),
    }]);
    reCaptchaHandler({})(engine);
    const promise = engine.trigger('submit', {}, { reCaptchaToken: 'test_token' });
    (window as Json).grecaptcha = {
      ready: jest.fn((callback) => callback()),
      execute: jest.fn(() => Promise.resolve('test_token')),
    };
    element.onload();
    const result = await promise;
    expect(document.createElement).toHaveBeenCalled();
    expect(result[0]).toEqual({ reCaptchaToken: 'test_token' });
    document.createElement = unmockedCreateElement;
    document.getElementsByTagName = unmockedGetElementsByTagName;
  });

  test('submit hook - reCAPTCHA client already loaded', async () => {
    reCaptchaHandler({})(engine);
    (window as Json).grecaptcha = {
      ready: jest.fn((callback) => callback()),
      execute: jest.fn(() => Promise.resolve('test_token')),
    };
    const promise = engine.trigger('submit', {}, { reCaptchaToken: 'test_token' });
    const result = await promise;
    expect(result[0]).toEqual({ reCaptchaToken: 'test_token' });
  });
});
