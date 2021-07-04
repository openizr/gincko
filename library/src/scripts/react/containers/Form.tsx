/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import useStore from 'diox/connectors/react';
import Step from 'scripts/react/components/Step';
import stepPropType from 'scripts/propTypes/step';
import PropTypes, { InferProps } from 'prop-types';
import Engine, { UserAction } from 'scripts/core/Engine';
import { Components } from 'scripts/react/components/Field';
import configurationPropType from 'scripts/propTypes/configuration';

const propTypes = {
  activeStep: PropTypes.string,
  configuration: PropTypes.shape(configurationPropType).isRequired,
  customComponents: PropTypes.objectOf(PropTypes.func.isRequired),
};

const defaultProps = {
  activeStep: null,
  customComponents: {},
};

/**
 * Dynamic form.
 */
export default function Form(props: InferProps<typeof propTypes>): JSX.Element {
  const { configuration, customComponents, activeStep } = props;
  const [engine] = React.useState(() => new Engine(configuration));
  const [useCombiner, mutate] = useStore(engine.getStore());
  const [state] = useCombiner('steps');

  const onUserAction = (userAction: UserAction): void => {
    mutate('userActions', 'ADD', userAction);
  };

  return (
    <form className="form">
      <div className="form__steps">

        {/* Steps. */}
        {state.steps.map((step: InferProps<typeof stepPropType>, index: number) => {
          const key = `${index}_${step.id}`;
          const isActive = (activeStep !== null)
            ? activeStep === step.id
            : index === state.steps.length - 1;

          return (
            <Step
              key={key}
              id={step.id}
              index={index}
              isActive={isActive}
              fields={step.fields}
              status={step.status}
              onUserAction={onUserAction}
              customComponents={customComponents as Components}
            />
          );
        })}

        {/* Step loader. */}
        {(state.loadingNextStep === true) ? <div className="ui-loader" /> : null}

      </div>
    </form>
  );
}

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;
Form.displayName = 'Form';
