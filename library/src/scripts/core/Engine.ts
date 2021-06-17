/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  Step,
  Hook,
  Field,
  FormEvent,
  UserAction,
  FormValues,
  Configuration,
} from 'scripts/types';
import Store from 'diox';
import { deepCopy } from 'basx';
import steps from 'scripts/core/steps';
import userActions from 'scripts/core/userActions';
import valuesLoader from 'scripts/plugins/valuesLoader';
import errorHandler from 'scripts/plugins/errorHandler';
import valuesChecker from 'scripts/plugins/valuesChecker';
import valuesUpdater from 'scripts/plugins/valuesUpdater';
import loaderDisplayer from 'scripts/plugins/loaderDisplayer';
import reCaptchaHandler from 'scripts/plugins/reCaptchaHandler';

/**
 * Form engine.
 */
export default class Engine {
  /** Diox store instance. */
  private store: Store;

  /** Form engine configuration. Contains steps, elements, ... */
  private configuration: Configuration;

  /** Contains all events hooks to trigger when events are fired. */
  private hooks: { [eventName: string]: Hook[]; };

  /** Contains the actual form steps, as they are currently displayed to end-user. */
  private generatedSteps: Step[];

  /** Contains last value of each form field. */
  private formValues: FormValues;

  /**
   * Triggers hooks chain for the given event.
   *
   * @param {FormEvent} eventName Event's name.
   *
   * @param {Json} [data = undefined] Additional data to pass to the hooks chain.
   *
   * @returns {Promise} Pending hooks chain.
   *
   * @throws {Error} If any event hook does not return a Promise.
   */
  private triggerHooks(eventName: FormEvent, data?: Json): Promise<Json> {
    const hooksChain = this.hooks[eventName].concat([]).reverse().reduce((chain, hook) => (
      (updatedData: Json): Promise<Json> => {
        const hookResult = hook(updatedData, chain as (data: Json) => Promise<Json>);
        if (!(hookResult && typeof hookResult.then === 'function')) {
          throw new Error(`Event "${eventName}": all your hooks must return a Promise.`);
        }
        return hookResult;
      }
    ), (updatedData: Json) => Promise.resolve(updatedData));
    // Hooks chain must first be wrapped in a Promise to catch all errors with proper error hooks.
    return Promise.resolve()
      .then(() => (hooksChain as (data: Json) => Promise<Json>)(data))
      .then((updatedData) => {
        if (updatedData === undefined) {
          throw new Error(
            `Event "${eventName}": data passed to the next hook is "undefined".`
            + ' This usually means that you did not correctly resolved your hook\'s Promise with'
            + ' proper data.',
          );
        }
        return updatedData;
      })
      .catch((error) => this.triggerHooks('error', error).then(() => null))
      .finally(() => this.updateCurrentStep(this.getCurrentStep(), true));
  }

  /**
   * Updates list of generated steps.
   *
   * @param {number} stepIndex Index of the step to create or update.
   *
   * @param {Step} step Created or updated step.
   *
   * @returns {void}
   */
  private updateGeneratedSteps(stepIndex: number, step: Step): void {
    // We always remove further steps as logic may have changed depending on last user inputs.
    const newSteps = this.generatedSteps.slice(0, stepIndex).concat([step]);
    this.store.mutate('steps', 'SET', { steps: newSteps });

    // We trigger related hooks if we just loaded a new step.
    // Do not change this `if...else` structure as we must compare lengths before updating steps!
    if (this.generatedSteps.length < newSteps.length) {
      this.generatedSteps = newSteps;
      const nextStep = newSteps[newSteps.length - 1];
      this.triggerHooks('loadedNextStep', nextStep).then((updatedNextStep: Step) => {
        if (updatedNextStep !== null) {
          this.updateCurrentStep(updatedNextStep);
        }
      });
    } else {
      this.generatedSteps = newSteps;
    }
  }

  /**
   * Loads the next step with given id.
   *
   * @param {string | null} [nextStepId] Id of the next step to load.
   *
   * @returns {void}
   */
  private loadNextStep(nextStepId?: string | null): void {
    const nextStep = this.generateStep(nextStepId || null);
    this.triggerHooks('loadNextStep', nextStep).then((updatedNextStep: Step) => {
      if (updatedNextStep !== null) {
        const currentStepIndex = this.generatedSteps.length - 1;
        this.updateGeneratedSteps(currentStepIndex + 1, updatedNextStep);
      }
    });
  }

  /**
   * Handles form submission and next step computation.
   *
   * @param {UserAction} userAction Last user action.
   *
   * @returns {void}
   */
  private handleSubmit(userAction: UserAction): void {
    this.formValues[userAction.fieldId] = userAction.value;
    const currentStep = this.getCurrentStep();
    const stepConfiguration = this.configuration.steps[currentStep.id];
    const shouldLoadNextStep = this.configuration.fields[userAction.fieldId].loadNextStep === true
      || this.configuration.steps[currentStep.id].fields.slice(-1)[0] === userAction.fieldId;
    if (userAction.type === 'input' && shouldLoadNextStep) {
      const submitPromise = (stepConfiguration.submit === true)
        ? this.triggerHooks('submit', this.formValues)
        : Promise.resolve(this.formValues);
      submitPromise.then((updatedFormValues) => {
        if (updatedFormValues !== null) {
          this.formValues = updatedFormValues;
          this.loadNextStep((typeof stepConfiguration.nextStep === 'function')
            ? stepConfiguration.nextStep(updatedFormValues)
            : stepConfiguration.nextStep);
        }
      });
    }
  }

  /**
   * Handles user actions, applying core logic such as hooks triggering or next step generation.
   *
   * @param {UserAction | null} userAction New state sent by `userActions` store module.
   *
   * @returns {void}
   */
  private handleUserAction(userAction: UserAction | null): void {
    if (userAction !== null) {
      // If user changes a field in a previous step, it may have an impact on next steps to display.
      // Thus, it is not necessary to keep any more step than the one containing last user action.
      this.generatedSteps = this.generatedSteps.slice(0, userAction.stepIndex + 1);
      this.triggerHooks('userAction', userAction).then((updatedUserAction) => {
        if (updatedUserAction !== null) {
          this.handleSubmit(updatedUserAction);
        }
      });
    }
  }

  /**
   * Class constructor.
   *
   * @param {Configuration} configuration Form engine configuration.
   *
   * @returns {void}
   */
  constructor(configuration: Configuration) {
    const store = new Store();
    store.register('steps', steps);
    store.register('userActions', userActions);
    this.store = store;
    this.configuration = configuration;
    this.generatedSteps = [];
    this.formValues = {};
    this.hooks = {
      error: [],
      submit: [],
      userAction: [],
      loadNextStep: [],
      loadedNextStep: [],
    };

    // Be careful: plugins' order matters!
    (configuration.plugins || []).concat([
      errorHandler(),
      reCaptchaHandler(configuration.reCaptchaHandlerOptions || {} as Json),
      loaderDisplayer(configuration.loaderDisplayerOptions || {} as Json),
      valuesUpdater(),
      valuesChecker(configuration.valuesCheckerOptions || {} as Json),
      valuesLoader(configuration.valuesLoaderOptions || {} as Json),
    ]).forEach((adapter) => {
      adapter({
        on: this.on.bind(this),
        getStore: this.getStore.bind(this),
        getValues: this.getValues.bind(this),
        loadValues: this.loadValues.bind(this),
        getConfiguration: this.getConfiguration.bind(this),
        hideStepLoader: this.hideStepLoader.bind(this),
        displayStepLoader: this.displayStepLoader.bind(this),
        getFieldIndex: this.getFieldIndex.bind(this),
        getCurrentStep: this.getCurrentStep.bind(this),
        updateCurrentStep: this.updateCurrentStep.bind(this),
        generateField: this.generateField.bind(this),
        generateStep: this.generateStep.bind(this),
      });
    });

    // Engine initialization.
    // NOTE: we must NOT subscribe to `steps` module, as it would generate asynchronous updates
    // on the engine's `generatedSteps` attribute, which would lead to unpredictable behaviours.
    // `generatedSteps` MUST stay the single source of truth, and `steps` module must be only used
    // for unidirectional notification to the view.
    this.store.subscribe('userActions', this.handleUserAction.bind(this));
    this.loadNextStep(configuration.root);
  }

  /**
   * Returns form's configuration.
   *
   * @returns {Configuration} Form's configuration.
   */
  public getConfiguration(): Configuration {
    return deepCopy(this.configuration);
  }

  /**
   * Generates field with the given id from configuration.
   *
   * @param {string} fieldId Field id.
   *
   * @returns {Field} Generated field.
   *
   * @throws {Error} If the field does not exist.
   */
  public generateField(fieldId: string): Field {
    const field = this.configuration.fields[fieldId];
    const nonInteractiveFields = this.configuration.nonInteractiveFields || ['Message'];
    if (field === undefined) {
      throw new Error(`Field "${fieldId}" does not exist.`);
    }
    return ({
      id: fieldId,
      type: field.type,
      message: null,
      status: nonInteractiveFields.includes(field.type) ? 'success' : 'initial',
      value: field.value,
      label: field.label,
      options: field.options || {},
    });
  }

  /**
   * Generates step with the given id from configuration.
   *
   * @param {string | null} stepId Step id.
   *
   * @returns {Step | null} Generated step, or `null`.
   *
   * @throws {Error} If the step does not exist.
   */
  public generateStep(stepId: string | null): Step | null {
    if (stepId === null) {
      return null;
    }
    const step = this.configuration.steps[stepId];
    if (step === undefined) {
      throw new Error(`Step "${stepId}" does not exist.`);
    }
    return {
      id: stepId,
      status: 'initial',
      fields: this.configuration.steps[stepId].fields.map(this.generateField.bind(this)),
    };
  }

  /**
   * Retrieves form fields values that have been filled.
   *
   * @returns {FormValues} Form values.
   */
  public getValues(): FormValues {
    return deepCopy(this.formValues);
  }

  /**
   * Loads the given form fields values into current step.
   *
   * @param {FormValues} values Form values to load in form.
   *
   * @returns {void}
   */
  public loadValues(values: FormValues): void {
    const stepIndex = this.generatedSteps.length - 1;
    const currentStep = this.generatedSteps[stepIndex];
    currentStep.fields.forEach((field) => {
      if (values[field.id] !== undefined) {
        const userAction = { type: 'input', value: values[field.id], fieldId: field.id };
        this.store.mutate('userActions', 'ADD', { stepIndex, ...userAction });
      }
    });
  }

  /**
   * Returns current store instance.
   *
   * @returns {Store} Current store instance.
   */
  public getStore(): Store {
    return this.store;
  }

  /**
   * Returns index of the field with the given id.
   *
   * @param {string} fieldId Field's id.
   *
   * @returns {number} Field's index in current step.
   */
  public getFieldIndex(fieldId: string): number {
    const currentStep = this.generatedSteps[this.generatedSteps.length - 1] || { fields: [] };
    return currentStep.fields.findIndex((field) => field.id === fieldId);
  }

  /**
   * Returns current generated step.
   *
   * @returns {Step} Current generated step.
   */
  public getCurrentStep(): Step {
    return deepCopy(this.generatedSteps[this.generatedSteps.length - 1]) || null;
  }

  /**
   * Updates current generated step with given info.
   *
   * @param {Step} updatedStep Updated info to set in current generated step.
   *
   * @param {boolean} [notify = false] Whether to notify all `steps` module's listeners.
   *
   * @returns {void}
   */
  public updateCurrentStep(updatedStep: Step, notify = false): void {
    const stepIndex = this.generatedSteps.length - 1;
    this.generatedSteps[stepIndex] = updatedStep;
    if (notify === true && stepIndex >= 0) {
      this.updateGeneratedSteps(stepIndex, updatedStep);
    }
  }

  /**
   * Registers a new hook for the given event.
   *
   * @param {FormEvent} eventName Name of the event to register hook for.
   *
   * @param {Hook} hook Hook to register.
   *
   * @returns {void}
   */
  public on(eventName: FormEvent, hook: Hook): void {
    this.hooks[eventName].push(hook);
  }

  /**
   * Displays a loader right after current step, indicating next step is being generated.
   *
   * @returns {void}
   */
  public displayStepLoader(): void {
    this.store.mutate('steps', 'SET_LOADER', { loadingNextStep: true });
  }

  /**
   * Hides the step loader.
   *
   * @returns {void}
   */
  public hideStepLoader(): void {
    this.store.mutate('steps', 'SET_LOADER', { loadingNextStep: false });
  }
}
