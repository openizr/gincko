/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin } from 'scripts/core/Engine';

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
      const currentStep = engine.getCurrentStep();
      const fieldIndex = engine.getFieldIndex(fieldId);
      if (type === 'input' && fieldIndex >= 0) {
        // We reset current step status to not stay in error state forever.
        currentStep.status = 'progress';
        currentStep.fields[fieldIndex].status = 'initial';
        currentStep.fields[fieldIndex].message = null;
        currentStep.fields[fieldIndex].value = value;
        engine.setCurrentStep(currentStep);
      }
      return next(userAction);
    });
  };
}
