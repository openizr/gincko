/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin } from 'scripts/core/Engine';
import { Step } from 'scripts/propTypes/step';

/**
 * Auto-loads values already filled by user when reloading next steps or page, for better UX.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function valuesLoader(): Plugin {
  return (engine): void => {
    const configuration = engine.getConfiguration();
    const autoFill = configuration.autoFill !== false;

    // Loads default values defined in configuration, as well as values already filled, if autofill
    // is enabled.
    engine.on('loadedNextStep', (nextStep, next) => {
      if (nextStep !== null) {
        const values = engine.getValues();
        const lastIndex = (<Step>nextStep).fields.length - 1;
        const stepIndex = engine.getCurrentStepIndex();
        (<Step>nextStep).fields.forEach((field) => {
          const shouldLoadNextStep = configuration.fields[field.id].loadNextStep === true
            || (<Step>nextStep).fields[lastIndex] === field;
          if (!shouldLoadNextStep && autoFill === true && values[field.id] !== undefined) {
            engine.userAction({
              type: 'input',
              stepIndex,
              stepId: (<Step>nextStep).id,
              fieldId: field.id,
              value: values[field.id],
            });
          } else if (field.value !== undefined) {
            engine.userAction({
              type: 'input',
              stepIndex,
              stepId: (<Step>nextStep).id,
              fieldId: field.id,
              value: field.value,
            });
          }
        });
      }
      return next(nextStep);
    });
  };
}
