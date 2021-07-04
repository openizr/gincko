/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin } from 'scripts/core/Engine';

/**
 * Plugin options.
 */
interface Options {
  /** Google's reCAPTCHA v3 site key. */
  siteKey: string;
}

/**
 * Automatically handles a reCAPTCHA challenge for current form.
 *
 * @param {Options} options Plugin's options.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function reCaptchaHandler(options: Options): Plugin {
  return (engine): void => {
    const { grecaptcha } = (window as Json);
    engine.on('submit', (formValues, next) => new Promise((resolve) => {
      const submit = (client: Json): void => {
        client.ready(() => {
          client.execute(options.siteKey, { action: 'submit' }).then((token: string) => {
            resolve(token);
          });
        });
      };
      if (grecaptcha === undefined) {
        const script = document.createElement('script');
        script.onload = (): void => { submit((window as Json).grecaptcha); };
        script.type = 'text/javascript';
        script.src = `https://www.google.com/recaptcha/api.js?render=${options.siteKey}`;
        document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        submit(grecaptcha);
      }
    }).then((reCaptchaToken) => next({ ...formValues, reCaptchaToken })));
  };
}
