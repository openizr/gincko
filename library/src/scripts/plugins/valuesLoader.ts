/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin, Field, FormValue } from 'scripts/types';

interface Options {
  enabled?: boolean;
  autoSubmit?: boolean;
  injectValuesTo?: string[];
}

/**
 * Auto-loads values already filled by user when loading next steps, for better UX.
 *
 * @param {Options} options Plugin's options.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function valuesLoader(options: Options): Plugin {
  return (engine): void => {
    const enabled = options.enabled !== false;
    const autoSubmit = options.autoSubmit === true;
    const formValues: { [fieldId: string]: FormValue; } = {};
    const injectValuesTo = options.injectValuesTo || ['Message'];

    if (enabled === true) {
      engine.on('userAction', (userAction, next) => {
        if (userAction !== null) {
          formValues[userAction.fieldId] = userAction.value;
        }
        return next(userAction);
      });
      engine.on('loadNextStep', (nextStep, next) => next((nextStep === null) ? nextStep : {
        ...nextStep,
        fields: nextStep.fields.map((field: Field) => ((injectValuesTo.includes(field.type))
          ? { ...field, options: { ...field.options, formValues } }
          : field)),
      }));
    }

    // Automatically injects form values in specified fields' options to allow for more dynamic
    // behaviours such as using filled values as variables in another step's message field.
    // Also loads values defined by default in configuration's fields.
    engine.on('loadedNextStep', (nextStep, next) => {
      if (nextStep !== null) {
        const defaultValues: { [fieldId: string]: FormValue; } = {};
        nextStep.fields.forEach((field: Field) => {
          if (field.value !== undefined && field.value !== null) {
            defaultValues[field.id] = field.value;
          }
        });
        const allValues = { ...defaultValues, ...formValues };
        if (nextStep.fields.length > 0) {
          if (autoSubmit === false) {
            delete allValues[nextStep.fields[nextStep.fields.length - 1].id];
          }
          engine.loadValues(allValues);
        }
      }
      return next(nextStep);
    });
  };
}
