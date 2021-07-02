/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * basx mock.
 */
const deepCopy = jest.fn((value) => ((process.env.DEEP_COPY === 'undefined') ? undefined : ({ ...value })));
const deepMerge = jest.fn((object1, object2) => ({ ...object1, ...object2 }));
export { deepCopy, deepMerge };
