/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin, Field, FormValues } from 'scripts/types';

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
    const configuration = engine.getConfiguration();
    const injectValuesTo = options.injectValuesTo || ['Message'];
    const defaultValues = Object.entries(configuration.fields).reduce((values, [id, field]) => (
      (field.value !== undefined && field.value !== null)
        ? { ...values, [id]: field.value }
        : values
    ), {});

    if (enabled === true) {
      // Automatically injects form values in specified fields' options to allow for more dynamic
      // behaviours such as using filled values as variables in another step's message field.
      engine.on('loadNextStep', (nextStep, next) => next((nextStep === null) ? nextStep : {
        ...nextStep,
        fields: nextStep.fields.map((field: Field) => ((injectValuesTo.includes(field.type))
          ? { ...field, options: { ...field.options, formValues: engine.getValues() } }
          : field)),
      }));
    }

    // Loads values defined by default in configuration's fields, as well as values already filled.
    engine.on('loadedNextStep', (nextStep, next) => {
      if (nextStep !== null && nextStep.fields.length > 0) {
        const allValues: FormValues = { ...defaultValues, ...engine.getValues() };
        if (autoSubmit === false) {
          delete allValues[nextStep.fields[nextStep.fields.length - 1].id];
        }
        engine.loadValues(allValues);
      }
      return next(nextStep);
    });
  };
}
