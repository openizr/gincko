/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin } from 'scripts/core/Engine';

/**
 * Plugin options.
 */
interface Options {
  /** Minimum time during which loader should be displayed. */
  timeout?: number;
}

/**
 * Displays a loader each time a new step is being loaded, for better UX.
 *
 * @param {Options} [options = {}] Plugin's options.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function loaderDisplayer(options: Options = {}): Plugin {
  return (engine): void => {
    const timeout = options.timeout || 250;
    const configuration = engine.getConfiguration();
    // This timestamp is used to mesure total time between user action and next step rendering.
    // In case some long asynchronous operations are performed in plugins, we don't want to apply
    // the extra "fake" loading time, thus we directly display next step. On the other hand, if no
    // asynchronous operation is performed in plugins, we still want to display the loader during
    // a minimum time to unify user experience across the form.
    let startTimestamp = Date.now();

    // Optimizes number of mutations on store.
    let loading = false;

    // Displays loader when next step must be loaded, hides loader if an error occurs in any hook.
    engine.on('userAction', (userAction, next) => {
      if (userAction !== null) {
        const { type, fieldId } = userAction;
        const currentStep = engine.getCurrentStep();
        const shouldLoadNextStep = configuration.fields[fieldId].loadNextStep === true
          || (fieldId === currentStep.fields.slice(-1)[0].id);
        if (shouldLoadNextStep && type === 'input') {
          loading = true;
          engine.toggleStepLoader(true);
          startTimestamp = Date.now();
        }
      }
      return next(userAction).then((updatedUserAction) => {
        if (loading === true && updatedUserAction === null) {
          loading = false;
          engine.toggleStepLoader(false);
        }
        return Promise.resolve(updatedUserAction);
      });
    });

    // Keeps loader while next step is being loaded, hides loader if an error occurs in any hook.
    engine.on('loadNextStep', (nextStep, next) => (
      next(nextStep).then((updatedNextStep) => new Promise<typeof nextStep>((resolve) => {
        const elapsedTime = Date.now() - startTimestamp;
        setTimeout(() => resolve(updatedNextStep), Math.max(timeout - elapsedTime, 0));
      })).then((updatedNextStep) => {
        if (loading === true && updatedNextStep === null) {
          loading = false;
          engine.toggleStepLoader(false);
        }
        return Promise.resolve(updatedNextStep);
      })
    ));

    // Hides loader once next step is fully loaded.
    engine.on('loadedNextStep', (nextStep, next) => {
      if (loading === true) {
        loading = false;
        engine.toggleStepLoader(false);
      }
      return next(nextStep);
    });
  };
}
