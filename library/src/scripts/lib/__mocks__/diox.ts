/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * diox mock.
 */
class Store {
  public register = jest.fn();

  public mutate = jest.fn();

  public subscribe = jest.fn();
}

export default Store;
