/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';

/**
 * Textfield mock.
 */
export default function Textfield(props: Any): JSX.Element {
  // const { onChange } = props;

  // Covers `onChange` handler.
  // if (onChange !== undefined) {
  //   setTimeout(() => {
  //     onChange('test');
  //   }, 10);
  // }
  return (
    <div>{JSON.stringify(props)}</div>
  );
}
