/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'gincko/plugins' {
  import { Plugin } from 'gincko';

  type GreCaptcha = { grecaptcha: Client; };
  type Client = {
    ready: (callback: () => void) => void;
    execute: (...args: (string | Record<string, string>)[]) => Promise<string>;
  };

  interface ReCaptchaHandlerOptions {
    /** Google's reCAPTCHA v3 site key. */
    siteKey: string;
  }

  /**
   * Automatically handles a reCAPTCHA challenge for current form.
   *
   * @param {ReCaptchaHandlerOptions} options Plugin's options.
   *
   * @returns {Plugin} The actual plugin.
   */
  export function reCaptchaHandler(options: ReCaptchaHandlerOptions): Plugin;

  interface ErrorStepDisplayerOptions {
    /** Id of the error step in the configuration. */
    stepId: string;

    /** Callback used to set active form step to the error step. */
    setActiveStep: (stepId: string) => void;
  }

  /**
   * Gracefully handles errors by displaying a generic error step.
   *
   * @param {ErrorStepDisplayerOptions} options Plugin options.
   *
   * @returns {Plugin} The actual gincko plugin.
   */
  export function errorStepDisplayer(options: ErrorStepDisplayerOptions): Plugin;

  interface LoaderDisplayerOptions {
    /** Minimum time during which loader should be displayed. */
    timeout?: number;
  }

  /**
   * Displays a loader each time a new step is being loaded, for better UX.
   *
   * @param {LoaderDisplayerOptions} [options = {}] Plugin's options.
   *
   * @returns {Plugin} The actual plugin.
   */
  export function loaderDisplayer(options?: LoaderDisplayerOptions): Plugin;
}
