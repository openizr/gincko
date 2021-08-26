/**
 * Copyright (c) KivFinance, Inc.
 * All rights reserved.
 */

import { Plugin } from 'scripts/core/Engine';
import { Step } from 'scripts/propTypes/step';

/**
 * Handles steps' submitting fields states (disabled, loading, ...) depending on its status.
 *
 * @returns {Plugin} The actual gincko plugin.
 */
export default function submittingFieldsManager(): Plugin {
  return (engine): void => {
    const configuration = engine.getConfiguration();

    // Adds or remove disabled state depending on step status.
    engine.on('userAction', (userAction, next) => {
      if (userAction === null) {
        return next(userAction);
      }
      return next(userAction).then((updatedUserAction) => {
        const currentStep = <Step>engine.getCurrentStep();
        const numberOfFields = currentStep.fields.length;
        const isSuccess = (currentStep.status === 'success');
        for (let i = 0; i < numberOfFields; i += 1) {
          const field = currentStep.fields[i];
          if (configuration.fields[field.id].loadNextStep === true || i === numberOfFields - 1) {
            const currentModifiers = (field.options?.modifiers || '').replace(/\s?disabled/g, '');
            if (isSuccess) {
              field.options = { ...field.options, modifiers: currentModifiers };
            } else {
              field.options = { ...field.options, modifiers: `${currentModifiers} disabled` };
            }
          }
        }
        engine.setCurrentStep(currentStep);
        return Promise.resolve(updatedUserAction);
      });
    });

    // Adds/removes loading state on next step loading.
    engine.on('loadNextStep', (nextStep, next) => {
      let currentStep = engine.getCurrentStep();
      if (currentStep !== null) {
        const numberOfFields = currentStep.fields.length;
        for (let i = 0; i < numberOfFields; i += 1) {
          const field = currentStep.fields[i];
          if (configuration.fields[field.id].loadNextStep === true || i === numberOfFields - 1) {
            const currentModifiers = field.options?.modifiers || '';
            field.options = { ...field.options, modifiers: `${currentModifiers} disabled loading` };
          }
        }
        engine.setCurrentStep(currentStep, true);
        return next(nextStep).then((updatedNextStep) => {
          currentStep = <Step>engine.getCurrentStep();
          for (let i = 0; i < numberOfFields; i += 1) {
            const field = currentStep.fields[i];
            if (configuration.fields[field.id].loadNextStep === true || i === numberOfFields - 1) {
              const currentModifiers = field.options?.modifiers || '';
              field.options = { ...field.options, modifiers: currentModifiers.replace(/\s?(disabled|loading)/g, '') };
            }
          }
          engine.setCurrentStep(currentStep);
          return Promise.resolve(updatedNextStep);
        });
      }
      return next(nextStep);
    });

    // Removes disabled/loading state in case of submission error.
    engine.on('submit', (formValues, next) => {
      let currentStep = <Step>engine.getCurrentStep();
      const numberOfFields = currentStep.fields.length;
      for (let i = 0; i < numberOfFields; i += 1) {
        const field = currentStep.fields[i];
        if (configuration.fields[field.id].loadNextStep === true || i === numberOfFields - 1) {
          const currentModifiers = field.options?.modifiers || '';
          field.options = { ...field.options, modifiers: `${currentModifiers} disabled loading` };
        }
      }
      engine.setCurrentStep(currentStep, true);
      return next(formValues).then((updatedFormValues) => {
        if (updatedFormValues === null) {
          currentStep = <Step>engine.getCurrentStep();
          for (let i = 0; i < numberOfFields; i += 1) {
            const field = currentStep.fields[i];
            if (configuration.fields[field.id].loadNextStep === true || i === numberOfFields - 1) {
              const currentModifiers = field.options?.modifiers || '';
              field.options = { ...field.options, modifiers: currentModifiers.replace(/\s?(disabled|loading)/g, '') };
            }
          }
          engine.setCurrentStep(currentStep);
        }
        return Promise.resolve(updatedFormValues);
      });
    });
  };
}
