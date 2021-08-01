/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { buildClass, markdown } from 'sonar-ui/react';

const propTypes = {
  label: PropTypes.string,
  modifiers: PropTypes.string,
  id: PropTypes.string.isRequired,
};

const defaultProps = {
  label: '',
  modifiers: '',
};

/**
 * Message field type.
 */
export default function Message(props: InferProps<typeof propTypes>): JSX.Element {
  const { id, label, modifiers } = props;

  return (
    <section
      id={id}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: markdown(label as string, false) }}
      className={buildClass('ui-message', (modifiers as string).split(' '))}
    />
  );
}

Message.propTypes = propTypes;
Message.defaultProps = defaultProps;
Message.displayName = 'Message';
