/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import Field from 'scripts/react/Field';
import { buildClass } from 'biuty/react';

interface StepProps {
  i18n: I18n;
  step: Step;
  index: number;
  isActive: boolean;
  variables: Variables;
  userInputs: UserInputs;
  onUserAction: OnUserAction;
  customComponents: CustomComponents;
}

/**
 * React form step.
 */
function Step(props: StepProps): JSX.Element {
  const { i18n, index, step } = props;
  const { customComponents, isActive } = props;
  const { variables, userInputs, onUserAction } = props;
  const modifiers = [step.status, step.id, isActive ? 'active' : ''].join(' ');

  return (
    <div id={`${step.id}__${index}`} className={buildClass('gincko__step', modifiers)}>
      {
        <div className="gincko__step__fields">
          {/* Key is composed of both step and field ids, in order to ensure each field is correctly
         reset when user changes his journey in previous steps. */}
          {step.fields.map((field) => ((field === null) ? null : (
            <Field
              i18n={i18n}
              field={field}
              isActive={isActive}
              variables={variables}
              userInputs={userInputs}
              onUserAction={onUserAction}
              customComponents={customComponents}
              key={`${step.id}.${index}.${field.id}`}
              path={`${step.id}.${index}.${field.id}`}
            />
          )))}
        </div>
      }
    </div>
  );
}

export default React.memo(Step) as JSXElement;
