/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import localforage from 'localforage';
import { Plugin, Field, FormValues } from 'scripts/types';

interface Options {
  cacheId?: string;
  enabled?: boolean;
  autoSubmit?: boolean;
  injectValuesTo?: string[];
}

/**
 * Auto-loads values already filled by user when reloading next steps or page, for better UX.
 *
 * @param {Options} options Plugin's options.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function valuesLoader(options: Options): Plugin {
  let loadedCache = false;
  let timeout: number | null = null;
  const enabled = options.enabled !== false;
  const autoSubmit = options.autoSubmit === true;
  const cacheKey = `gincko_${options.cacheId || 'cache'}`;
  const injectValuesTo = options.injectValuesTo || ['Message'];

  return (engine): void => {
    const configuration = engine.getConfiguration();
    const formValues = Object.entries(configuration.fields).reduce((values, [id, field]) => (
      (field.value !== undefined && field.value !== null)
        ? { ...values, [id]: field.value }
        : values
    ), {}) as FormValues;

    if (enabled === true) {
      // Stores new user inputs into cache.
      engine.on('userAction', (userAction, next) => next(userAction).then((updatedUserAction) => {
        if (updatedUserAction !== null) {
          Object.assign(formValues, { [updatedUserAction.fieldId]: updatedUserAction.value });
          window.clearTimeout(timeout as number);
          timeout = window.setTimeout(() => {
            localforage.setItem(cacheKey, JSON.stringify(formValues));
          }, 500);
        }
        return Promise.resolve(updatedUserAction);
      }));

      // Automatically injects form values in specified fields' options to allow for more dynamic
      // behaviours such as using filled values as variables in another step's message field.
      engine.on('loadNextStep', (nextStep, next) => next((nextStep === null) ? nextStep : {
        ...nextStep,
        fields: nextStep.fields.map((field: Field) => ((injectValuesTo.includes(field.type))
          ? { ...field, options: { ...field.options, formValues } }
          : field)),
      }));
    }

    // Loads default values defined in configuration's fields, as well as values already filled.
    engine.on('loadedNextStep', (nextStep, next) => {
      // Retrieving stored values from cache...
      const cachePromise = (loadedCache === false)
        ? localforage.getItem(cacheKey)
        : Promise.resolve(null);

      return cachePromise.then((storedValues) => {
        loadedCache = true;
        if (storedValues !== null) {
          Object.assign(formValues, JSON.parse(storedValues as string));
        }

        if (nextStep !== null && nextStep.fields.length > 0) {
          const submittingValues: FormValues = {};
          const nonSubmittingValues: FormValues = {};
          const lastIndex = nextStep.fields.length - 1;
          nextStep.fields.forEach((field: Field, index: number) => {
            if (configuration.fields[field.id].loadNextStep === true || index === lastIndex) {
              submittingValues[field.id] = formValues[field.id];
            } else {
              nonSubmittingValues[field.id] = formValues[field.id];
            }
          });

          engine.loadValues(nonSubmittingValues);
          if (autoSubmit === true) {
            engine.loadValues(submittingValues);
          }
        }
        return next(nextStep);
      });
    });
  };
}
