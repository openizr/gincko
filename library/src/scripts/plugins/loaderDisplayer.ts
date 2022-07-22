/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Plugin } from 'scripts/index.d';

interface LoaderDisplayerOptions {
  /** Minimum time during which loader should be displayed. */
  timeout?: number;
}

/**
 * Displays a loader each time a new step is being loaded, for better UX.
 *
 * @param {LoaderDisplayerOptions} [options = {}] Plugin's options.
 *
 * @returns {Plugin} The actual plugin.
 */
export default function loaderDisplayer(options: LoaderDisplayerOptions = {}): Plugin {
  return (engine): void => {
    const timeout = options.timeout || 250;
    // This timestamp is used to mesure total time between user action and next step rendering.
    // In case some long asynchronous operations are performed in plugins, we don't want to apply
    // the extra "fake" loading time, thus we directly display next step. On the other hand, if no
    // asynchronous operation is performed in plugins, we still want to display the loader during
    // a minimum time to unify user experience across the form.
    let startTimestamp = Date.now();

    // Optimizes number of mutations on store.
    let loading = false;

    // Displays loader when next step must be loaded, hides loader if an error occurs in any hook.
    engine.on('userAction', async (userAction, next) => {
      const currentStep = engine.getCurrentStep();
      if (userAction !== null && currentStep !== null) {
        const { type, path } = <UserAction>userAction;
        const fieldConfiguration = <GenericFieldConfiguration>engine.getConfiguration(path);
        if (fieldConfiguration?.submit && type === 'input') {
          loading = true;
          engine.toggleLoader(true);
          startTimestamp = Date.now();
        }
      }
      const updatedUserAction = await next(userAction);
      if (loading === true && updatedUserAction === null) {
        loading = false;
        engine.toggleLoader(false);
      }
      return updatedUserAction;
    });

    // Keeps loader while next step is being loaded, hides loader if an error occurs in any hook.
    engine.on('step', async (nextStep, next) => {
      const updatedNextStep = await next(nextStep);
      const elapsedTime = Date.now() - startTimestamp;
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(updatedNextStep);
        }, Math.max(timeout - elapsedTime, 0));
      });
      if (loading === true && updatedNextStep === null) {
        loading = false;
        engine.toggleLoader(false);
      }
      return updatedNextStep;
    });

    // Hides loader once next step is fully loaded.
    engine.on('afterStep', (nextStep, next) => {
      if (loading === true) {
        loading = false;
        engine.toggleLoader(false);
      }
      return next(nextStep);
    });
  };
}
