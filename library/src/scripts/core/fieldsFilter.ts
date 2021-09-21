/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Step } from 'scripts/propTypes/step';
import { Field } from 'scripts/propTypes/field';
import { AnyValues, Plugin, UserAction } from 'scripts/core/Engine';

/**
 * Filters conditionally displayed fields.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function fieldsFilter(): Plugin {
  return (engine): void => {
    const configuration = engine.getConfiguration();

    engine.on('userAction', (userAction, next) => {
      const currentStep = engine.getCurrentStep();
      if (userAction === null || currentStep === null) {
        return next(userAction);
      }

      const newInputs: AnyValues = {};
      const newFields: Field[] = [];
      const { fieldId, value } = <UserAction>userAction;
      const values = { ...engine.getVariables(), ...engine.getValues(), [fieldId]: value };
      configuration.steps[currentStep.id].fields.forEach((currentFieldId) => {
        const fieldIndex = engine.getFieldIndex(currentFieldId);
        const displayIf = configuration.fields[currentFieldId].displayIf || null;
        if (displayIf === null || displayIf(values) === true) {
          let newField = currentStep.fields[fieldIndex];
          if (fieldIndex < 0) {
            newField = engine.createField(currentFieldId);
            newInputs[currentFieldId] = newField.value;
          }
          newFields.push(newField);
        }
      });
      currentStep.fields = newFields;
      engine.setCurrentStep(currentStep);

      // Triggering `userAction` hook for all newly created fields...
      Object.keys(newInputs).forEach((id) => {
        engine.userAction({ ...<UserAction>userAction, fieldId: id, value: newInputs[id] });
      });

      return next(userAction);
    });

    engine.on('loadNextStep', (nextStep, next) => next(nextStep).then((updatedNextStep) => {
      if (updatedNextStep === null) {
        return Promise.resolve(updatedNextStep);
      }

      const newFields: Field[] = [];
      const values = { ...engine.getVariables(), ...engine.getValues() };
      (<Step>updatedNextStep).fields.forEach((field) => {
        const displayIf = configuration.fields[field.id]?.displayIf || null;
        if (displayIf === null || displayIf(values) === true) {
          newFields.push(field);
        }
      });
      return Promise.resolve({ ...updatedNextStep, fields: newFields });
    }));
  };
}
