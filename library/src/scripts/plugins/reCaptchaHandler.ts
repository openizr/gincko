/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin } from 'scripts/index.d';

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
 * @param options Plugin's options.
 *
 * @returns The actual plugin.
 */
export default function reCaptchaHandler(options: ReCaptchaHandlerOptions): Plugin {
  return (engine): void => {
    const { grecaptcha } = <Window & { grecaptcha?: Client; }>window;
    engine.on('submit', (userInputs, next) => new Promise((resolve) => {
      const submit = (client: Client): void => {
        client.ready(() => {
          client.execute(options.siteKey, { action: 'submit' }).then((token) => {
            resolve(token);
          });
        });
      };
      if (grecaptcha === undefined) {
        const script = document.createElement('script');
        script.onload = (): void => { submit((window as unknown as GreCaptcha).grecaptcha); };
        script.type = 'text/javascript';
        script.src = `https://www.google.com/recaptcha/api.js?render=${options.siteKey}`;
        document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        submit(grecaptcha);
      }
    }).then((reCaptchaToken) => next({ ...userInputs, reCaptchaToken })));
  };
}
