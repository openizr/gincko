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
  variables: PropTypes.objectOf(PropTypes.string.isRequired),
};

const defaultProps = {
  label: '',
  modifiers: '',
  variables: {},
};

/**
 * Message field type.
 */
export default function Message(props: InferProps<typeof propTypes>): JSX.Element {
  // eslint-disable-next-line object-curly-newline
  const { id, label, variables, modifiers } = props;

  // We perform dynamic form values injection into message if necessary.
  const filledLabel = React.useMemo(() => {
    let newLabel = label as string;
    Object.keys(variables as Record<string, string>).forEach((key) => {
      newLabel = newLabel.replace(new RegExp(`{{${key}}}`, 'g'), (variables as Record<string, string>)[key]);
    });
    return newLabel;
  }, [label, variables]);

  return (
    <section
      id={id}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: markdown(filledLabel, false) }}
      className={buildClass('ui-message', (modifiers as string).split(' '))}
    />
  );
}

Message.propTypes = propTypes;
Message.defaultProps = defaultProps;
Message.displayName = 'Message';
