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
import { UserAction } from 'scripts/core/Engine';
import stepPropType from 'scripts/propTypes/step';
import Field, { Components } from 'scripts/react/components/Field';

const defaultProps = {};

/**
 * Form step.
 */
export default function Step(props: InferProps<typeof stepPropType>): JSX.Element {
  const { i18n } = props;
  const { index, id, status } = props;
  const { fields, customComponents, isActive } = props;

  const onUserAction = (userAction: UserAction): void => {
    const fullUserAction: UserAction = { ...userAction, stepIndex: index as number, stepId: id };
    (props.onUserAction as (userAction: UserAction) => void)(fullUserAction);
  };

  return (
    <div className={buildClass('form-step', [status, id, isActive ? 'active' : ''])}>
      <div className="form-step__fields">
        {/* Key is composed of both step and field ids, in order to ensure each field is correctly
        reset when user changes his journey in previous steps. */}
        {fields.map((field) => (
          <Field
            i18n={i18n}
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
