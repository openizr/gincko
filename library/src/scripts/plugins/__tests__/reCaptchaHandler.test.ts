/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import { reCaptchaHandler } from 'scripts/plugins';
import BaseEngine from 'scripts/core/__mocks__/Engine';

describe('plugins/reCaptchaHandler', () => {
  let engine: BaseEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new BaseEngine();
    reCaptchaHandler({ siteKey: 'testKey' })(engine as unknown as Engine);
  });

  test('submit hook - reCAPTCHA client not loaded', async () => {
    const element = { onload: jest.fn() };
    const unmockedCreateElement = document.createElement;
    const unmockedGetElementsByTagName = document.getElementsByTagName;
    Object.assign(document, { createElement: jest.fn(() => element) });
    Object.assign(document, {
      getElementsByTagName: jest.fn(() => [{
        appendChild: jest.fn(),
      }]),
    });
    const promise = engine.trigger('submit', { reCaptchaToken: 'test_token' });
    Object.assign(window, {
      grecaptcha: {
        ready: jest.fn((callback) => callback()),
        execute: jest.fn(() => Promise.resolve('test_token')),
      },
    });
    element.onload();
    const result = await promise;
    expect(document.createElement).toHaveBeenCalled();
    expect(result).toEqual({ reCaptchaToken: 'test_token' });
    document.createElement = unmockedCreateElement;
    document.getElementsByTagName = unmockedGetElementsByTagName;
  });

  test('submit hook - reCAPTCHA client already loaded', async () => {
    Object.assign(window, {
      grecaptcha: {
        ready: jest.fn((callback) => callback()),
        execute: jest.fn(() => Promise.resolve('test_token')),
      },
    });
    const result = await engine.trigger('submit', { reCaptchaToken: 'test_token' });
    expect(result).toEqual({ reCaptchaToken: 'test_token' });
  });
});
