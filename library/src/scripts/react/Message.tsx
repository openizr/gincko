/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import { buildClass, markdown } from 'biuty/react';

interface MessageProps {
  id: string;
  label?: string;
  modifiers?: string;
}

/**
 * Message field type.
 */
function Message({ id, label = '', modifiers = '' }: MessageProps): JSX.Element {
  return (
    <section
      id={id}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: markdown(label as string, false) }}
      className={buildClass('ui-message', modifiers)}
    />
  );
}

export default React.memo(Message) as JSXElement;
