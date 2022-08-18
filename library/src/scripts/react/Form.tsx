/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import Step from 'scripts/react/Step';
import Engine from 'scripts/core/Engine';
import useStore from 'diox/connectors/react';
import { StateState } from 'scripts/core/state';

interface FormProps {
  /** Form's active step's id. */
  activeStep?: string | null;

  /** Form's configuration. */
  configuration: Configuration,

  /** Internationalization function, used to translate form labels into different languages. */
  i18n?: I18n;

  /** List of form's custom UI components. */
  customComponents?: CustomComponents;

  /** Custom gincko form engine class to use instead of the default engine. */
  engineClass?: typeof Engine;

  /** UI component to use when loading steps. */
  loader?: JSX.Element | null;
}

/**
 * React form.
 */
function Form({
  loader = null,
  configuration,
  activeStep = null,
  customComponents = {},
  engineClass: EngineClass = Engine,
  i18n = (label: string): string => label,
}: FormProps): JSX.Element {
  const [engine] = React.useState(() => new EngineClass(configuration));
  const useCombiner = useStore(engine.getStore());
  const state = useCombiner<StateState>('state');

  const onUserAction = React.useCallback((type: string, path: string, data: UserInput): void => {
    engine.getStore().mutate('userActions', 'ADD', { type, path, data });
  }, [engine]);

  const preventSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
  }, []);

  return (
    <form id={configuration.id} className="gincko" onSubmit={preventSubmit}>
      {
        <div className="gincko__steps">
          {state.steps.map((step, index) => {
            const key = `${step.id}.${index}`;
            const isActive = (activeStep !== null)
              ? activeStep === step.id
              : index === state.steps.length - 1;

            return (
              <Step
                key={key}
                step={step}
                i18n={i18n}
                index={index}
                isActive={isActive}
                onUserAction={onUserAction}
                variables={state.variables}
                userInputs={state.userInputs}
                customComponents={customComponents}
              />
            );
          })}

          {state.loading && loader}
        </div> as JSXElement
      }
    </form> as JSXElement
  );
}

export default React.memo(Form, (prevProps, nextProps) => (
  prevProps.loader === nextProps.loader
  && prevProps.i18n === nextProps.i18n
  && prevProps.activeStep === nextProps.activeStep
  && prevProps.customComponents === nextProps.customComponents
)) as JSXElement;
