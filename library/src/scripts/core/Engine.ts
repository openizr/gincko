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
import { Step } from 'scripts/propTypes/step';
import { Field } from 'scripts/propTypes/field';
import userActions from 'scripts/core/userActions';
import valuesLoader from 'scripts/core/valuesLoader';
import errorHandler from 'scripts/core/errorHandler';
import valuesChecker from 'scripts/core/valuesChecker';
import valuesUpdater from 'scripts/core/valuesUpdater';
import { Configuration } from 'scripts/propTypes/configuration';

type HookData = FormValues | Error | Step | UserAction | null;

export type Plugin = (engine: Engine) => void;
export type FormValue = any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
  private hooks: { [eventName: string]: Hook<FormValues | Error | Step | UserAction | null>[]; };

  /** Contains the actual form steps, as they are currently displayed to end-user. */
  private generatedSteps: Step[];

  /** Contains last value of each form field. */
  private formValues: FormValues;

  /**
   * Triggers hooks chain for the given event.
   *
   * @TODO Throwing an error in a hook should block execution of the .then statement after
   * `triggerHook` call => put .then promise as argument of `triggerHook`?
   *
   * @param {FormEvent} eventName Event's name.
   *
   * @param {FormValues | Error | Step | UserAction | null} [data = undefined] Additional data
   * to pass to the hooks chain.
   *
   * @returns {Promise<FormValues | Error | Step | UserAction | null>} Pending hooks chain.
   *
   * @throws {Error} If any event hook does not return a Promise.
   */
  private triggerHooks(eventName: FormEvent, data?: HookData): Promise<HookData> {
    const hooksChain = this.hooks[eventName].concat([]).reverse().reduce((chain, hook) => (
      (updatedData): Promise<HookData> => {
        const hookResult = hook(updatedData, chain as (data?: HookData) => Promise<HookData>);
        if (!(hookResult && typeof hookResult.then === 'function')) {
          throw new Error(`Event "${eventName}": all your hooks must return a Promise.`);
        }
        return hookResult;
      }
    ), (updatedData) => Promise.resolve(updatedData));
    // Hooks chain must first be wrapped in a Promise to catch all errors with proper error hooks.
    return Promise.resolve()
      .then(() => (hooksChain as (data?: HookData) => Promise<HookData>)(data))
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
      .catch((error) => {
        // Disabling cache on error prevents the form to be stucked in error step forever.
        this.useCache = false;
        return (eventName === 'error')
          ? this.hooks.error.slice(-1)[0](error, () => Promise.resolve(null))
          : this.triggerHooks('error', error).then(() => null);
      })
      .finally(() => {
        this.setCurrentStep(this.generatedSteps[this.getCurrentStepIndex()] || null, true);
        window.clearTimeout(this.cacheTimeout as number);
        // If cache is enabled, we store current form state, except after submission, when
        // cache must be completely cleared.
        if (this.useCache && eventName !== 'submit') {
          this.cacheTimeout = window.setTimeout(() => {
            localforage.setItem(this.cacheKey, {
              formValues: this.formValues,
              // We remove all functions from fields' options as they can't be stored in IndexedDB.
              steps: this.generatedSteps.map((step) => ({
                ...step,
                fields: step.fields.map((field) => ({
                  ...field,
                  options: Object.keys(field.options).reduce((options, key) => {
                    if (typeof field.options[key] !== 'function') {
                      Object.assign(options, { [key]: field.options[key] });
                    }
                    return options;
                  }, {}),
                })),
              })),
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
          this.setCurrentStep(<Step>updatedNextStep);
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
        this.updateGeneratedSteps(this.getCurrentStepIndex() + 1, <Step>updatedNextStep);
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
    const { fieldId } = userAction;
    const { id, fields } = this.generatedSteps[this.getCurrentStepIndex()];
    const { submit, nextStep } = this.configuration.steps[id];
    const { loadNextStep } = this.configuration.fields[fieldId];
    const shouldLoadNextStep = (loadNextStep || fields[fields.length - 1].id === fieldId);
    if (shouldLoadNextStep) {
      const formValues = this.getValues();
      const submitPromise = (submit === true)
        ? this.triggerHooks('submit', formValues)
        : Promise.resolve(formValues);
      submitPromise.then((updatedFormValues) => {
        if (updatedFormValues !== null) {
          this.setValues(updatedFormValues);
          this.loadNextStep((typeof nextStep === 'function') ? nextStep(updatedFormValues) : nextStep);
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
      if (userAction.type === 'input') {
        this.generatedSteps = this.generatedSteps.slice(0, userAction.stepIndex + 1);
      }
      this.triggerHooks('userAction', userAction).then((updatedUserAction) => {
        if (updatedUserAction !== null) {
          const { type, value, fieldId } = <UserAction>updatedUserAction;
          if (type === 'input') {
            this.formValues[fieldId] = value;
            this.handleSubmit.bind(this)(<UserAction>updatedUserAction);
          }
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
    ]).forEach((hook) => {
      hook({
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
    localforage.getItem<{ formValues: FormValues; steps: Step[]; }>(this.cacheKey).then((data) => {
      const parsedData = data || { formValues: {}, steps: [] };
      if (this.useCache && this.configuration.autoFill !== false) {
        this.formValues = parsedData.formValues;
      }
      if (data !== null && this.useCache && this.configuration.restartOnReload !== true) {
        const lastStepIndex = parsedData.steps.length - 1;
        const lastStep = parsedData.steps[lastStepIndex];
        // As we removed function-typed options from fields before storing data in cache,
        // we must re-inject them on form loading to keep a consistent behaviour.
        parsedData.steps.forEach((step, stepIndex) => {
          step.fields.forEach((field, fieldIndex) => {
            parsedData.steps[stepIndex].fields[fieldIndex].options = {
              ...configuration.fields[field.id].options,
              ...field.options,
            };
          });
        });
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
   * @returns {Step | null} Current generated step.
   */
  public getCurrentStep(): Step | null {
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
   * @param {Hook<FormValues | Error | Step | UserAction | null>} hook Hook to register.
   *
   * @returns {void}
   */
  public on(eventName: FormEvent, hook: Hook<FormValues | Error | Step | UserAction | null>): void {
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
