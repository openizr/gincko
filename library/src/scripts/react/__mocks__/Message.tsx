/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';

/**
 * gincko/react/Message mock.
 */
export default function Message(props: Any): JSX.Element {
  return <div id="field">{JSON.stringify(props)}</div>;
}
