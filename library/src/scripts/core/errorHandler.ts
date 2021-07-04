/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin } from 'scripts/core/Engine';

/**
 * Displays hooks errors in console.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function errorHandler(): Plugin {
  return (engine): void => {
    engine.on('error', (error, next) => {
      console.error(error); // eslint-disable-line no-console
      return next(error);
    });
  };
}
