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
    const configuration = engine.getConfiguration();

    engine.on('userAction', (userAction, next) => {
      if (userAction === null) {
        return next(userAction);
      }
      const { fieldId, value, type } = userAction;
      if (type === 'input') {
        const currentStep = engine.getCurrentStep();
        const fieldIndex = engine.getFieldIndex(fieldId);
        const fieldConfiguration = configuration.fields[fieldId];
        const transform = fieldConfiguration.transform || ((input: FormValue): FormValue => input);
        // We reset current step status to not stay in error state forever.
        currentStep.status = 'progress';
        currentStep.fields[fieldIndex].status = 'initial';
        currentStep.fields[fieldIndex].message = null;
        currentStep.fields[fieldIndex].value = transform(value);
        engine.setCurrentStep(currentStep);
      }
      return next(userAction);
    });
  };
}
