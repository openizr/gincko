/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Step } from 'scripts/propTypes/step';
import { Plugin, AnyValue, UserAction } from 'scripts/core/Engine';

const isEmpty = (value: AnyValue): boolean => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return `${(value || '')}`.trim().length === 0;
};

/**
 * Checks that all necessary fields have correctly been filled-in by user.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function valuesChecker(): Plugin {
  return (engine): void => {
    const configuration = engine.getConfiguration();
    const onSubmit = configuration.checkValuesOnSubmit === true;

    engine.on('userAction', (userAction, next) => {
      if (userAction === null) {
        return next(userAction);
      }
      const { fieldId, type } = <UserAction>userAction;
      const currentStep = <Step>engine.getCurrentStep();
      if (type === 'input') {
        // Allows to switch step status to "success" when all fields are in "success" status.
        let allFieldsSucceeded = true;
        for (let index = 0; index < currentStep.fields.length; index += 1) {
          const field = currentStep.fields[index];
          const fieldIsRequired = configuration.fields[field.id].required === true;
          const shouldLoadNextStep = configuration.fields[fieldId].loadNextStep === true
            || (fieldId === currentStep.fields.slice(-1)[0].id);
          // If we are about to load next step, we check must all fields to ensure they are all
          // valid. Otherwise, we just check current one. If `onSubmit` option is set to `true`,
          // we only want to check all fields once, before loading next step.
          if ((field.id === fieldId && onSubmit === false) || shouldLoadNextStep === true) {
            const fieldIsEmpty = isEmpty(field.value);
            const messages = configuration.fields[field.id].messages || {};
            const validation = messages.validation || ((): undefined => undefined);
            const validationMessage = fieldIsEmpty ? null : validation(field.value) || null;
            if (fieldIsEmpty && !fieldIsRequired) {
              // Checking non required fields...
              field.status = 'initial';
            } else if (fieldIsRequired === true && fieldIsEmpty) {
              // Checking required fields...
              currentStep.status = 'error';
              field.status = 'error';
              field.message = messages.required;
            } else if (validationMessage !== null) {
              // Checking validation rules...
              currentStep.status = 'error';
              field.status = 'error';
              field.message = validationMessage;
            } else {
              field.status = 'success';
              field.message = messages.success;
            }
          }
          if (field.status !== 'success' && (field.status !== 'initial' || fieldIsRequired)) {
            allFieldsSucceeded = false;
          }
        }
        if (allFieldsSucceeded === true) {
          currentStep.status = 'success';
        }
      }

      engine.setCurrentStep(currentStep);
      return next((currentStep.status === 'error') ? null : userAction);
    });
  };
}
