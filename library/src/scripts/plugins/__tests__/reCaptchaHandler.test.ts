/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import BaseEngine from 'scripts/core/Engine';
import { reCaptchaHandler } from 'scripts/plugins';
import Engine from 'scripts/core/__mocks__/Engine';

describe('plugins/reCaptchaHandler', () => {
  let engine: Engine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new Engine();
    reCaptchaHandler({ siteKey: 'testKey' })(engine as unknown as BaseEngine);
  });

  test('submit hook - reCAPTCHA client not loaded', async () => {
    const element = { onload: vi.fn() };
    const unmockedCreateElement = document.createElement;
    const unmockedGetElementsByTagName = document.getElementsByTagName;
    Object.assign(document, { createElement: vi.fn(() => element) });
    Object.assign(document, {
      getElementsByTagName: vi.fn(() => [{
        appendChild: vi.fn(),
      }]),
    });
    const promise = engine.trigger('submit', { reCaptchaToken: 'test_token' });
    Object.assign(window, {
      grecaptcha: {
        ready: vi.fn((callback) => callback()),
        execute: vi.fn(() => Promise.resolve('test_token')),
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
        ready: vi.fn((callback) => callback()),
        execute: vi.fn(() => Promise.resolve('test_token')),
      },
    });
    const result = await engine.trigger('submit', { reCaptchaToken: 'test_token' });
    expect(result).toEqual({ reCaptchaToken: 'test_token' });
  });
});
