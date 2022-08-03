/* istanbul ignore file */

/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable */

import { isPlainObject } from 'basx';

// https://typeofnan.dev/roll-your-own-javascript-immutability-function-using-the-proxy-object/
export default function deepFreeze(obj: any): any {
  if (isPlainObject(obj)) {
    return new Proxy(obj, {
      get(target, prop) {
        return typeof target[prop] === 'object'
          ? deepFreeze(target[prop])
          : target[prop];
      },
      set() {
        throw new Error('Object is immutable.');
      },
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(deepFreeze);
  }
  return obj;
}
