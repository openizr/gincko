/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin, FormValue } from 'scripts/types';

/**
 * Updates last changed field accordingly with user action.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function valuesUpdater(): Plugin {
  return (engine): void => {
    engine.on('userAction', (userAction, next) => {
      if (userAction === null) {
        return next(userAction);
      }
      const { fieldId, value, type } = userAction;
      if (type === 'input') {
        const currentStep = engine.getCurrentStep();
        const configuration = engine.getConfiguration().fields[fieldId];
        const transform = configuration.transform || ((input: FormValue): FormValue => input);
        const fieldIndex = currentStep.fields.findIndex((field) => field.id === fieldId);
        // We reset current step status to not stay in error state forever.
        currentStep.status = 'progress';
        currentStep.fields[fieldIndex].status = 'initial';
        currentStep.fields[fieldIndex].message = null;
        currentStep.fields[fieldIndex].value = transform(value);
        engine.updateCurrentStep(currentStep);
      }
      return next(userAction);
    });
  };
}
