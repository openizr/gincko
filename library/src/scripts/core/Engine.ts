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
import state from 'scripts/core/state';
import { Step } from 'scripts/propTypes/step';
import { Field } from 'scripts/propTypes/field';
import userActions from 'scripts/core/userActions';
import fieldsFilter from 'scripts/core/fieldsFilter';
import valuesLoader from 'scripts/core/valuesLoader';
import errorHandler from 'scripts/core/errorHandler';
import valuesChecker from 'scripts/core/valuesChecker';
import valuesUpdater from 'scripts/core/valuesUpdater';
import { Configuration } from 'scripts/propTypes/configuration';

type HookData = AnyValues | Error | Step | UserAction | null;

export type Plugin = (engine: Engine) => void;
export type AnyValue = any; // eslint-disable-line @typescript-eslint/no-explicit-any
export type Hook<Type> = (data: Type, next: (data?: Type) => Promise<Type>) => Promise<Type>;
export type FormEvent = 'start' | 'loadNextStep' | 'loadedNextStep' | 'userAction' | 'submit' | 'error';

export interface UserAction {
  stepId: string;
  fieldId: string;
  stepIndex: number;
  type: 'input' | 'click';
  value: AnyValue;
}

export interface AnyValues {
  [fieldId: string]: AnyValue;
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
  private cacheTimeout: NodeJS.Timeout | null;

  /** Form engine configuration. Contains steps, elements, ... */
  private configuration: Configuration;

  /** Contains all events hooks to trigger when events are fired. */
  private hooks: { [eventName: string]: Hook<AnyValues | Error | Step | UserAction | null>[]; };

  /** Contains the actual form steps, as they are currently displayed to end-user. */
  private generatedSteps: Step[];

  /** Contains last value of each form field. */
  private values: AnyValues;

  /** Contains user-defined variables, accessible anywhere, anytime in the form. */
  private variables: AnyValues;

  /**
   * Triggers hooks chain for the given event.
   *
   * @TODO Throwing an error in a hook should block execution of the .then statement after
   * `triggerHook` call => put .then promise as argument of `triggerHook`?
   * @TODO Update cache only when calling setValues or setCurrentStep with notify = true or
   * toggleLoader and remove cache timeout for more reliability.
   *
   * @param {FormEvent} eventName Event's name.
   *
   * @param {AnyValues | Error | Step | UserAction | null} [data = undefined] Additional data
   * to pass to the hooks chain.
   *
   * @returns {Promise<AnyValues | Error | Step | UserAction | null>} Pending hooks chain.
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
        if (updatedData === undefined && eventName !== 'start') {
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
        if (this.generatedSteps[this.getCurrentStepIndex()]) {
          this.setCurrentStep(this.generatedSteps[this.getCurrentStepIndex()], true);
        }
        clearTimeout(this.cacheTimeout as NodeJS.Timeout);
        // If cache is enabled, we store current form state, except after submission, when
        // cache must be completely wiped out.
        if (eventName !== 'submit') {
          this.cacheTimeout = setTimeout(this.updateCache.bind(this), 500);
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
    this.store.mutate('state', 'UPDATE', {
      steps: newSteps,
      values: this.values,
      variables: this.variables,
    });

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
   * Updates form's cached data.
   *
   * @returns {Promise<void>}
   */
  private async updateCache(): Promise<void> {
    if (this.useCache) {
      await localforage.setItem(this.cacheKey, {
        values: this.values,
        variables: this.variables,
        // We remove all functions from fields' options as they can't be stored in IndexedDB.
        steps: this.generatedSteps.map((step) => ({
          ...step,
          fields: step.fields.map((field) => ({
            ...field,
            options: Object.keys(field.options).reduce((options, key) => (
              (typeof field.options[key] !== 'function')
                ? Object.assign(options, { [key]: field.options[key] })
                : options
            ), {}),
          })),
        })),
      });
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
    try {
      const nextStep = this.createStep(nextStepId || null);
      this.triggerHooks('loadNextStep', nextStep).then((updatedNextStep) => {
        if (updatedNextStep !== null) {
          this.updateGeneratedSteps(this.getCurrentStepIndex() + 1, <Step>updatedNextStep);
        }
      });
    } catch (error) {
      // Disabling cache on error prevents the form to be stucked in error step forever.
      this.useCache = false;
      this.triggerHooks('error', <Error>error);
    }
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
      const values = this.getValues();
      const submitPromise = (submit === true) ? this.triggerHooks('submit', values) : Promise.resolve(values);
      submitPromise.then((updatedValues) => {
        if (updatedValues !== null) {
          this.loadNextStep((typeof nextStep === 'function') ? nextStep(updatedValues) : nextStep);
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
            this.values[fieldId] = value;
            this.setCurrentStep(this.generatedSteps[this.getCurrentStepIndex()], true);
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
    store.register('state', state);
    store.register('userActions', userActions);
    this.store = store;
    this.values = {};
    this.cacheTimeout = null;
    this.generatedSteps = [];
    this.configuration = configuration;
    this.variables = configuration.variables || {};
    this.useCache = this.configuration.cache !== false;
    this.cacheKey = `gincko_${configuration.id || 'cache'}`;
    this.hooks = {
      start: [],
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
      fieldsFilter(),
    ]).forEach((hook) => {
      hook({
        on: this.on.bind(this),
        getStore: this.getStore.bind(this),
        getValues: this.getValues.bind(this),
        setVariables: this.setVariables.bind(this),
        getVariables: this.getVariables.bind(this),
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
    localforage.getItem<{
      values: AnyValues; variables: AnyValues; steps: Step[];
    }>(this.cacheKey).then((data) => {
      const parsedData = data || { values: {}, steps: [], variables: {} };
      if (this.useCache && this.configuration.autoFill !== false) {
        this.values = parsedData.values;
      }
      this.setVariables(parsedData.variables);
      let callback = (): void => { this.loadNextStep(configuration.root); };
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
        callback = (): void => { this.updateGeneratedSteps(lastStepIndex, lastStep); };
      }
      this.triggerHooks('start').then((status) => {
        if (status !== null) {
          callback();
        }
      });
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
   * Returns current generated step index.
   *
   * @returns {number} Current generated step index.
   */
  public getCurrentStepIndex(): number {
    return Math.max(0, this.generatedSteps.length - 1);
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
    if (notify === true) {
      this.updateGeneratedSteps(stepIndex, updatedStep);
    }
  }

  /**
   * Registers a new hook for the given event.
   *
   * @param {FormEvent} eventName Name of the event to register hook for.
   *
   * @param {Hook<AnyValues | Error | Step | UserAction | null>} hook Hook to register.
   *
   * @returns {void}
   */
  public on(eventName: FormEvent, hook: Hook<AnyValues | Error | Step | UserAction | null>): void {
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
    this.store.mutate('state', 'SET_LOADER', { loadingNextStep: display });
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
   * Retrieves current form fields values.
   *
   * @returns {AnyValues} Form values.
   */
  public getValues(): AnyValues {
    return deepCopy(this.values);
  }

  /**
   * Clears current form cache.
   *
   * @returns {Promise<void>}
   */
  public async clearCache(): Promise<void> {
    return localforage.removeItem(this.cacheKey);
  }

  /**
   * Retrieves current form variables.
   *
   * @returns {AnyValues} Form variables.
   */
  public getVariables(): AnyValues {
    return deepCopy(this.variables);
  }

  /**
   * Adds or overrides the given form variables.
   *
   * @param {AnyValues} variables Form variables to add or override.
   *
   * @returns {void}
   */
  public setVariables(variables: AnyValues): void {
    Object.assign(this.variables, deepCopy(variables));
    this.updateCache();
  }
}
