/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import { InferProps } from 'prop-types';
import { buildClass } from 'sonar-ui/react';
import stepPropType from 'scripts/propTypes/step';
import Field from 'scripts/react/components/Field';
import { UserAction, Components } from 'scripts/types';

const defaultProps = {};

/**
 * Form step.
 */
export default function Step(props: InferProps<typeof stepPropType>): JSX.Element {
  // eslint-disable-next-line object-curly-newline
  const { id, status, index, fields, customComponents, isActive } = props;

  const onUserAction = (fieldId: string, userAction: UserAction): void => {
    (props.onUserAction as Json)(index, fieldId, userAction);
  };

  return (
    <div className={buildClass('form-step', [status, id, isActive ? 'active' : ''])}>
      <div className="form-step__fields">
        {/* Key is composed of both step and field ids, in order to ensure each field is correctly
        reset when user changes his journey in previous steps. */}
        {fields.map((field) => (
          <Field
            id={field.id}
            active={isActive}
            key={`${id}_${field.id}`}
            type={field.type}
            label={field.label}
            value={field.value}
            status={field.status}
            options={field.options}
            message={field.message}
            onUserAction={onUserAction}
            customComponents={customComponents as Components}
          />
        ))}
      </div>
    </div>
  );
}

Step.propTypes = stepPropType;
Step.defaultProps = defaultProps;
Step.displayName = 'Step';
