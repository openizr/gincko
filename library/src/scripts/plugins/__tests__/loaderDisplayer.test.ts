/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { loaderDisplayer } from 'scripts/plugins';
import BaseEngine from 'scripts/core/__mocks__/Engine';

vi.useFakeTimers();

describe('plugins/loaderDisplayer', () => {
  let engine: BaseEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new BaseEngine();
    delete process.env.NULL_NEXT_DATA;
    loaderDisplayer()(engine as unknown as Engine);
  });

  describe('userAction hook', () => {
    test('input on non-submitting step field', async () => {
      await engine.trigger('userAction', { path: 'root.0.wrong', type: 'input' });
      expect(engine.toggleLoader).not.toHaveBeenCalled();
    });

    test('input on submitting step field', async () => {
      await engine.trigger('userAction', { path: 'root.0.submit', type: 'input' });
      expect(engine.toggleLoader).toHaveBeenCalledTimes(1);
      expect(engine.toggleLoader).toHaveBeenCalledWith(true);
    });

    test('input on last step field with hooks interruption', async () => {
      process.env.NULL_NEXT_DATA = 'true';
      await engine.trigger('userAction', { path: 'root.0.submit', type: 'input' });
      expect(engine.toggleLoader).toHaveBeenCalledTimes(2);
      expect(engine.toggleLoader).toHaveBeenCalledWith(true);
      expect(engine.toggleLoader).toHaveBeenCalledWith(false);
    });
  });

  describe('step hook', () => {
    test('normal behaviour', async () => {
      await engine.trigger('userAction', null);
      const result = engine.trigger('step', null);
      // We need the following line as a `setTimeout` is called in an intermediary Promise.
      const immediate = new Promise(setImmediate);
      vi.runAllTimers();
      await immediate;
      vi.runAllTimers();
      await result;
      expect(engine.toggleLoader).not.toHaveBeenCalled();
    });

    test('hook interruption', async () => {
      await engine.trigger('userAction', { path: 'root.0.submit', type: 'input' });
      const result = engine.trigger('step', null);
      // We need the following line as `setTimeout` is called in an intermediary Promise.
      const immediate = new Promise(setImmediate);
      vi.runAllTimers();
      await immediate;
      vi.runAllTimers();
      await result;
      expect(engine.toggleLoader).toHaveBeenCalledTimes(2);
      expect(engine.toggleLoader).toHaveBeenCalledWith(true);
      expect(engine.toggleLoader).toHaveBeenCalledWith(false);
    });
  });

  describe('afterStep hook', () => {
    test('loader still displayed', async () => {
      await engine.trigger('userAction', { path: 'root.0.submit', type: 'input' });
      await engine.trigger('afterStep', {});
      expect(engine.toggleLoader).toHaveBeenCalledTimes(2);
      expect(engine.toggleLoader).toHaveBeenCalledWith(true);
      expect(engine.toggleLoader).toHaveBeenCalledWith(false);
    });

    test('loader not displayed', async () => {
      await engine.trigger('userAction', { path: 'root.0.submit', type: 'input' });
      await engine.trigger('afterStep', {});
      expect(engine.toggleLoader).toHaveBeenCalledTimes(2);
      expect(engine.toggleLoader).toHaveBeenCalledWith(true);
      expect(engine.toggleLoader).toHaveBeenCalledWith(false);
    });
  });
});
