/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Json, Plugin } from 'scripts/types';

interface Options {
  onSubmit?: boolean;
}

const isEmpty = (value: Json): boolean => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return `${(value || '')}`.trim().length === 0;
};

/**
 * Checks that all necessary fields have correctly been filled-in by user.
 *
 * @param {Options} options Plugin's options.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function valuesChecker(options: Options): Plugin {
  const onSubmit = options.onSubmit || false;

  return (engine): void => {
    engine.on('userAction', (userAction, next) => {
      if (userAction === null) {
        return next(userAction);
      }
      const { fieldId, type } = userAction;
      const currentStep = engine.getCurrentStep();
      const configuration = engine.getConfiguration();
      const shouldLoadNextStep = (fieldId === currentStep.fields.slice(-1)[0].id);
      if (type === 'input') {
        // Allows to switch step status to "success" when all fields are in "success" status.
        let allFieldsSucceeded = true;
        for (let index = 0; index < currentStep.fields.length; index += 1) {
          const field = currentStep.fields[index];
          const fieldIsRequired = configuration.fields[field.id].required === true;
          // If we are about to load next step, we check must all fields to ensure they are all
          // valid. Otherwise, we just check current one. If `onSubmit` option is set to `true`,
          // we only want to check all fields once, before loading next step.
          if ((field.id === fieldId && onSubmit === false) || shouldLoadNextStep === true) {
            const fieldIsEmpty = isEmpty(field.value);
            const validation = configuration.fields[field.id].validation || ((): boolean => true);
            const messages = configuration.fields[field.id].messages || {};
            if (fieldIsEmpty && !fieldIsRequired) {
              // Checking non required fields...
              field.status = 'initial';
            } else if (fieldIsRequired === true && fieldIsEmpty) {
              // Checking required fields...
              currentStep.status = 'error';
              field.status = 'error';
              field.message = messages.required;
            } else if (!fieldIsEmpty && validation(field.value) === false) {
              // Checking validation rules...
              currentStep.status = 'error';
              field.status = 'error';
              field.message = messages.validation;
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

      engine.updateCurrentStep(currentStep);
      return next((currentStep.status === 'error') ? null : userAction);
    });
  };
}
