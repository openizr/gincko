/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * basx mock.
 */
export const deepMerge = jest.fn((obj1, obj2) => {
  const newObject = obj1;
  Object.keys(obj2).forEach((key) => {
    const firstValue = obj1[key];
    const secondValue = obj2[key];
    if (typeof firstValue === 'object') {
      newObject[key] = deepMerge(firstValue, secondValue);
    } else {
      newObject[key] = secondValue;
    }
  });
  return newObject;
});
export const deepCopy = jest.fn((obj) => obj);
export const isPlainObject = jest.fn((obj) => typeof obj === 'object' && obj?.constructor === Object);
