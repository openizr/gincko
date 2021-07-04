/**
 * Copyright (c) KivFinance, Inc.
 * All rights reserved.
 */

import { Plugin } from 'scripts/core/Engine';

/**
 * Plugin options.
 */
interface Options {
  /** Id of the error step in the configuration. */
  stepId: string;

  /** Callback used to set active form step to the error step. */
  setActiveStep: (stepId: string) => void;
}

/**
 * Gracefully handles errors by displaying a generic error step.
 *
 * @param {Options} options Plugin options.
 *
 * @returns {Plugin} The actual gincko plugin.
 */
export default function errorStepDisplayer(options: Options): Plugin {
  return (engine): void => {
    engine.on('error', (error, next) => {
      const errorStep = engine.createStep(options.stepId);
      if (errorStep !== null) {
        engine.setCurrentStep(errorStep);
        options.setActiveStep(options.stepId);
      }
      return next(error);
    });
  };
}
