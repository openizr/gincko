/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin } from 'scripts/types';

interface Options {
  timeout?: number;
  enabled?: boolean;
}

/**
 * Displays a loader each time a new step is being loaded, for better UX.
 *
 * @param {Options} options Plugin's options.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function loaderDisplayer(options: Options): Plugin {
  return (engine): void => {
    const enabled = options.enabled !== false;
    const timeout = options.timeout || 250;
    // This timestamp is used to mesure total time between user action and next step rendering.
    // In case some long asynchronous operations are performed in plugins, we don't want to apply
    // the extra "fake" loading time, thus we directly display next step. On the other hand, if no
    // asynchronous operation is performed in plugins, we still want to display the loader during
    // a minimum time to unify user experience across the form.
    let startTimestamp = Date.now();

    if (enabled === true) {
      // Optimizes number of mutations on store.
      let loading = false;
      engine.on('userAction', (userAction, next) => {
        if (userAction !== null) {
          const { type, fieldId } = userAction;
          const currentStep = engine.getCurrentStep();
          const shouldLoadNextStep = (fieldId === currentStep.fields.slice(-1)[0].id);
          if (shouldLoadNextStep === true && type === 'input') {
            loading = true;
            engine.displayStepLoader();
            startTimestamp = Date.now();
          }
        }
        return next(userAction).then((updatedUserAction) => {
          if (loading === true && updatedUserAction === null) {
            loading = false;
            engine.hideStepLoader();
          }
          return Promise.resolve(updatedUserAction);
        });
      });
      engine.on('loadNextStep', (nextStep, next) => (
        next(nextStep).then((updatedNextStep) => new Promise((resolve) => {
          const elapsedTime = Date.now() - startTimestamp;
          setTimeout(() => resolve(updatedNextStep), Math.max(timeout - elapsedTime, 0));
        })).then((updatedNextStep) => {
          if (loading === true && updatedNextStep === null) {
            loading = false;
            engine.hideStepLoader();
          }
          return Promise.resolve(updatedNextStep);
        })
      ));
      engine.on('loadedNextStep', (nextStep, next) => {
        if (loading === true) {
          loading = false;
          engine.hideStepLoader();
        }
        return next(nextStep);
      });
    } else {
      engine.hideStepLoader();
    }
  };
}
