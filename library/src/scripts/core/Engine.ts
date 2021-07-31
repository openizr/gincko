/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'diox';
import { deepCopy } from 'basx';
import localforage from 'localforage';
import steps from 'scripts/core/steps';
import userActions from 'scripts/core/userActions';
import valuesLoader from 'scripts/core/valuesLoader';
import errorHandler from 'scripts/core/errorHandler';
import valuesChecker from 'scripts/core/valuesChecker';
import valuesUpdater from 'scripts/core/valuesUpdater';
import { InferProps } from 'prop-types';
import stepPropTypes from 'scripts/propTypes/step';
import fieldPropTypes from 'scripts/propTypes/field';
import configurationPropTypes from 'scripts/propTypes/configuration';

export type FormValue = Json;
export type Plugin = (engine: Engine) => void;
export type Step = InferProps<typeof stepPropTypes>;
export type Field = InferProps<typeof fieldPropTypes>;
export type Configuration = InferProps<typeof configurationPropTypes>;
export type FormEvent = 'loadNextStep' | 'loadedNextStep' | 'userAction' | 'submit' | 'error';
export type Hook<Type> = (data: Type, next: (data?: Type) => Promise<Type>) => Promise<Type>;

export interface UserAction {
  stepId: string;
  fieldId: string;
  stepIndex: number;
  type: 'input' | 'click';
  value: FormValue;
}

export interface FormValues {
  [fieldId: string]: FormValue;
}

/**
 * Form engine.
 */
export default class Engine {
  /** Diox store instance. */
  private store: Store;

  /** Cache name key. */
  private cacheKey: string;

  /** Whether form should store its state in cache. */
  private useCache: boolean;

  /** Timeout after which to refresh cache. */
  private cacheTimeout: number | null;

  /** Form engine configuration. Contains steps, elements, ... */
  private configuration: Configuration;

  /** Contains all events hooks to trigger when events are fired. */
  private hooks: { [eventName: string]: Hook<Json>[]; };

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
  private triggerHooks(eventName: 'submit', data: FormValues | null): Promise<FormValues | null>;

  private triggerHooks(eventName: 'loadNextStep', data: Step | null): Promise<Step | null>;

  private triggerHooks(eventName: 'loadedNextStep', data: Step | null): Promise<Step | null>;

  private triggerHooks(eventName: 'userAction', data: UserAction | null): Promise<UserAction | null>;

  private triggerHooks(eventName: 'error', data: Error | null): Promise<Error | null>;

  private triggerHooks(eventName: FormEvent, data?: Json): Promise<Json> {
    const hooksChain = this.hooks[eventName].concat([]).reverse().reduce((chain, hook) => (
      (updatedData): Promise<Json> => {
        const hookResult = hook(updatedData, chain as (data: Json) => Promise<Json>);
        if (!(hookResult && typeof hookResult.then === 'function')) {
          throw new Error(`Event "${eventName}": all your hooks must return a Promise.`);
        }
        return hookResult;
      }
    ), (updatedData) => Promise.resolve(updatedData));
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
      // This safety mechanism prevents infinite loops when throwing errors from "error" hooks.
      .catch((error) => ((eventName === 'error')
        ? this.hooks.error.slice(-1)[0](error, () => Promise.resolve(null))
        : this.triggerHooks('error', error).then(() => null)))
      .finally(() => {
        const currentStep = this.generatedSteps[this.getCurrentStepIndex()] || null;
        this.setCurrentStep(currentStep, true);
        window.clearTimeout(this.cacheTimeout as number);
        // If cache is enabled, we store current form state, except after submission, when
        // cache must be completely cleared.
        if (this.useCache && eventName !== 'submit') {
          this.cacheTimeout = window.setTimeout(() => {
            localforage.setItem(this.cacheKey, {
              steps: this.generatedSteps,
              formValues: this.formValues,
            });
          }, 500);
        } else if (eventName === 'submit' && this.configuration.clearCacheOnSubmit !== false) {
          this.useCache = false;
          this.clearCache();
        }
      });
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
      this.triggerHooks('loadedNextStep', newSteps[newSteps.length - 1]).then((updatedNextStep) => {
        if (updatedNextStep !== null) {
          this.setCurrentStep(updatedNextStep);
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
    const nextStep = this.createStep(nextStepId || null);
    this.triggerHooks('loadNextStep', nextStep).then((updatedNextStep) => {
      if (updatedNextStep !== null) {
        this.updateGeneratedSteps(this.getCurrentStepIndex() + 1, updatedNextStep);
      }
    });
  }

  /**
   * Handles form submission and next step computation.
   *
   * @param {UserAction | null} userAction Last user action.
   *
   * @returns {void}
   */
  private handleSubmit(userAction: UserAction | null): void {
    if (userAction !== null && userAction.type === 'input') {
      const currentStep = this.generatedSteps[this.getCurrentStepIndex()];
      const stepConfiguration = this.configuration.steps[currentStep.id];
      const fieldConfiguration = this.configuration.fields[userAction.fieldId];
      const shouldLoadNextStep = (
        fieldConfiguration.loadNextStep === true
        || currentStep.fields[currentStep.fields.length - 1].id === userAction.fieldId
      );
      if (shouldLoadNextStep) {
        const formValues = this.getValues();
        const submitPromise = (stepConfiguration.submit === true)
          ? this.triggerHooks('submit', formValues)
          : Promise.resolve(formValues);
        submitPromise.then((updatedFormValues) => {
          if (updatedFormValues !== null) {
            this.setValues(updatedFormValues);
            this.loadNextStep((typeof stepConfiguration.nextStep === 'function')
              ? stepConfiguration.nextStep(updatedFormValues)
              : stepConfiguration.nextStep);
          }
        });
      }
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
    // If user changes a field in a previous step, it may have an impact on next steps to display.
    // Thus, it is not necessary to keep any more step than the one containing last user action.
    if (userAction !== null && userAction.type === 'input') {
      this.formValues[userAction.fieldId] = userAction.value;
      this.generatedSteps = this.generatedSteps.slice(0, userAction.stepIndex + 1);
    }
    this.triggerHooks('userAction', userAction).then(this.handleSubmit.bind(this));
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
    this.formValues = {};
    this.cacheTimeout = null;
    this.generatedSteps = [];
    this.configuration = configuration;
    this.useCache = this.configuration.cache !== false;
    this.cacheKey = `gincko_${configuration.id || 'cache'}`;
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
      valuesUpdater(),
      valuesChecker(),
      valuesLoader(),
    ]).forEach((adapter) => {
      adapter({
        on: this.on.bind(this),
        getStore: this.getStore.bind(this),
        getValues: this.getValues.bind(this),
        setValues: this.setValues.bind(this),
        userAction: this.userAction.bind(this),
        getConfiguration: this.getConfiguration.bind(this),
        toggleStepLoader: this.toggleStepLoader.bind(this),
        getFieldIndex: this.getFieldIndex.bind(this),
        getCurrentStep: this.getCurrentStep.bind(this),
        getCurrentStepIndex: this.getCurrentStepIndex.bind(this),
        setCurrentStep: this.setCurrentStep.bind(this),
        createField: this.createField.bind(this),
        createStep: this.createStep.bind(this),
        clearCache: this.clearCache.bind(this),
      });
    });

    // Engine initialization.
    // NOTE: we must NOT subscribe to `steps` module, as it would generate asynchronous updates
    // on the engine's `generatedSteps` attribute, which would lead to unpredictable behaviours.
    // `generatedSteps` MUST stay the single source of truth, and `steps` module must be only used
    // for unidirectional notification to the view.
    this.store.subscribe('userActions', this.handleUserAction.bind(this));

    // Depending on the configuration, we want either to load the complete form from cache, or just
    // its filled values and restart journey from the beginning.
    localforage.getItem(this.cacheKey).then((data: Json) => {
      const parsedData = data || { formValues: {} };
      if (this.useCache && this.configuration.autoFill !== false) {
        this.formValues = parsedData.formValues;
      }
      if (data !== null && this.useCache && this.configuration.restartOnReload !== true) {
        const lastStepIndex = parsedData.steps.length - 1;
        const lastStep = parsedData.steps[lastStepIndex];
        this.generatedSteps = parsedData.steps.slice(0, lastStepIndex);
        this.updateGeneratedSteps(lastStepIndex, lastStep);
      } else {
        this.loadNextStep(configuration.root);
      }
    });
  }

  /**
   * Returns form's configuration.
   *
   * @returns {Configuration} Form's configuration.
   */
  public getConfiguration(): Configuration {
    return this.configuration;
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
  public createField(fieldId: string): Field {
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
  public createStep(stepId: string | null): Step | null {
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
      fields: this.configuration.steps[stepId].fields.map(this.createField.bind(this)),
    };
  }

  /**
   * Retrieves current form fields values.
   *
   * @returns {FormValues} Form values.
   */
  public getValues(): FormValues {
    return deepCopy(this.formValues);
  }

  /**
   * Adds or overrides the given form values.
   *
   * @param {FormValues} values Form values to add.
   *
   * @returns {void}
   */
  public setValues(values: FormValues): void {
    Object.assign(this.formValues, deepCopy(values));
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
    const currentStep = this.generatedSteps[this.getCurrentStepIndex()] || { fields: [] };
    return currentStep.fields.findIndex((field) => field.id === fieldId);
  }

  /**
   * Returns current generated step.
   *
   * @returns {Step} Current generated step.
   */
  public getCurrentStep(): Step {
    return deepCopy(this.generatedSteps[this.getCurrentStepIndex()]) || null;
  }

  /**
   * Returns current generated step index.
   *
   * @returns {number} Current generated step index.
   */
  public getCurrentStepIndex(): number {
    return this.generatedSteps.length - 1;
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
  public setCurrentStep(updatedStep: Step, notify = false): void {
    const stepIndex = this.getCurrentStepIndex();
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
   * @param {Hook<Json>} hook Hook to register.
   *
   * @returns {void}
   */
  public on(eventName: 'userAction', hook: Hook<UserAction | null>): void;

  public on(eventName: 'loadNextStep', hook: Hook<Step | null>): void;

  public on(eventName: 'loadedNextStep', hook: Hook<Step | null>): void;

  public on(eventName: 'error', hook: Hook<Error | null>): void;

  public on(eventName: 'submit', hook: Hook<FormValues | null>): void;

  public on(eventName: FormEvent, hook: Hook<Json>): void {
    this.hooks[eventName].push(hook);
  }

  /**
   * Toggles a loader right after current step, indicating next step is/not being generated.
   *
   * @param {boolean} display Whether to display step loader.
   *
   * @returns {void}
   */
  public toggleStepLoader(display: boolean): void {
    this.store.mutate('steps', 'SET_LOADER', { loadingNextStep: display });
  }

  /**
   * Triggers the given user action.
   *
   * @param {UserAction} userAction User action to trigger.
   *
   * @returns {void}
   */
  public userAction(userAction: UserAction): void {
    this.store.mutate('userActions', 'ADD', userAction);
  }

  /**
   * Clears current form cache.
   *
   * @returns {Promise<void>}
   */
  public async clearCache(): Promise<void> {
    return localforage.removeItem(this.cacheKey);
  }
}
