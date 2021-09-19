/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import { State } from 'scripts/core/steps';
import useStore from 'diox/connectors/react';
import Step from 'scripts/react/components/Step';
import { generateRandomId } from 'sonar-ui/react';
import stepPropType from 'scripts/propTypes/step';
import PropTypes, { InferProps } from 'prop-types';
import Engine, { UserAction } from 'scripts/core/Engine';
import { Components } from 'scripts/react/components/Field';
import configurationPropType from 'scripts/propTypes/configuration';

const propTypes = {
  /** Form's active step's id. */
  activeStep: PropTypes.string,

  /** Form's configuration. */
  configuration: PropTypes.shape(configurationPropType).isRequired,

  /** Internationalization function, used to translate form labels into different languages. */
  i18n: PropTypes.func,

  /** List of form's custom components. */
  customComponents: PropTypes.objectOf(PropTypes.func.isRequired),
};

const defaultProps = {
  activeStep: null,
  customComponents: {},
  i18n: (label: string, values: Record<string, string> = {}): string => {
    let newLabel = label;
    Object.keys(values).forEach((key) => {
      newLabel = newLabel.replace(new RegExp(`{{${key}}}`, 'g'), values[key]);
    });
    return newLabel;
  },
};

/**
 * Sub-component that will actually render the form.
 */
export const ActualForm = (props: InferProps<typeof propTypes>): JSX.Element => {
  const { configuration, customComponents, activeStep } = props;
  const [engine] = React.useState(() => new Engine(configuration));
  const [useCombiner, mutate] = useStore(engine.getStore());
  const [state] = useCombiner<State>('steps');

  const onUserAction = (userAction: UserAction): void => {
    mutate('userActions', 'ADD', userAction);
  };

  const preventSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
  };

  return (
    <form id={configuration.id as string} className="gincko" onSubmit={preventSubmit}>
      <div className="gincko__steps">

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
              i18n={props.i18n}
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
};

ActualForm.propTypes = propTypes;
ActualForm.defaultProps = defaultProps;
ActualForm.displayName = 'ActualForm';

/**
 * Dynamic form.
 */
export default function Form(props: InferProps<typeof propTypes>): JSX.Element | null {
  const { i18n, customComponents } = props;
  const { configuration, activeStep } = props;
  const [key, setKey] = React.useState<string | null>(null);

  // Each time configuration changes, we want to generate a new Form component
  // to take those changes in account.
  React.useEffect(() => {
    setKey(generateRandomId());
  }, [configuration]);

  return (key === null) ? null : (
    <ActualForm
      key={key}
      i18n={i18n}
      activeStep={activeStep}
      configuration={configuration}
      customComponents={customComponents}
    />
  );
}

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;
Form.displayName = 'Form';
