/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';

/**
 * gincko/react/Step mock.
 */
export default function Step({ onUserAction, i18n, ...rest }: JSXElement): JSX.Element {
  // Covers default i18n function.
  i18n('test');
  // Covers userAction callback.
  onUserAction();
  return <div id="step">{JSON.stringify(rest)}</div>;
}
