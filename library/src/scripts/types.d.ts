/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'diox';
import * as PropTypes from 'prop-types';

/** Any valid JavaScript primitive. */
type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type Generic = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type FormValue = Json;
export type Plugin = (engine: Engine) => void;
export type Step = PropTypes.InferProps<{
  index: PropTypes.Requireable<number>;
  isActive: PropTypes.Requireable<boolean>;
  onUserAction: PropTypes.Requireable<(...args: Json[]) => Promise<Json>>;
  id: PropTypes.Validator<string>;
  status: PropTypes.Validator<string>;
  customComponents: PropTypes.Requireable<{
    [x: string]: (...args: Json[]) => Json;
  }>;
  fields: PropTypes.Validator<PropTypes.InferProps<{
    value: PropTypes.Requireable<Json>;
    active: PropTypes.Requireable<boolean>;
    label: PropTypes.Requireable<string>;
    message: PropTypes.Requireable<string>;
    id: PropTypes.Validator<string>;
    type: PropTypes.Validator<string>;
    status: PropTypes.Validator<string>;
    options: PropTypes.Validator<Json>;
  }>[]>;
}>;
export type Field = PropTypes.InferProps<{
  value: PropTypes.Requireable<Json>;
  active: PropTypes.Requireable<boolean>;
  label: PropTypes.Requireable<string>;
  message: PropTypes.Requireable<string>;
  id: PropTypes.Validator<string>;
  type: PropTypes.Validator<string>;
  status: PropTypes.Validator<string>;
  options: PropTypes.Validator<Json>;
}>;
export type Configuration = PropTypes.InferProps<{
  loaderDisplayerOptions: PropTypes.Requireable<PropTypes.InferProps<{
    enabled: PropTypes.Requireable<boolean>;
    timeout: PropTypes.Requireable<number>;
  }>>;
  reCaptchaHandlerOptions: PropTypes.Requireable<PropTypes.InferProps<{
    enabled: PropTypes.Requireable<boolean>;
    siteKey: PropTypes.Requireable<string>;
  }>>;
  valuesCheckerOptions: PropTypes.Requireable<PropTypes.InferProps<{
    onSubmit: PropTypes.Requireable<boolean>;
  }>>;
  valuesLoaderOptions: PropTypes.Requireable<PropTypes.InferProps<{
    cacheId: PropTypes.Requireable<string>;
    enabled: PropTypes.Requireable<boolean>;
    autoSubmit: PropTypes.Requireable<boolean>;
    injectValuesTo: PropTypes.Requireable<string[]>;
  }>>;
  root: PropTypes.Validator<string>;
  plugins: PropTypes.Requireable<((...args: Json[]) => void)[]>;
  nonInteractiveFields: PropTypes.Requireable<string[]>;
  steps: PropTypes.Validator<{
    [x: string]: PropTypes.InferProps<{
      fields: PropTypes.Validator<string[]>;
      submit: PropTypes.Requireable<boolean>;
      nextStep: PropTypes.Requireable<string | ((...args: Json[]) => string | null)>;
    }>;
  }>;
  fields: PropTypes.Validator<{
    [x: string]: PropTypes.InferProps<{
      type: PropTypes.Validator<string>;
      required: PropTypes.Requireable<boolean>;
      loadNextStep: PropTypes.Requireable<boolean>;
      label: PropTypes.Requireable<string>;
      messages: PropTypes.Requireable<PropTypes.InferProps<{
        success: PropTypes.Requireable<string>;
        required: PropTypes.Requireable<string>;
        validation: PropTypes.Requireable<(...args: Json[]) => string | null | undefined>;
      }>>;
      value: PropTypes.Requireable<Json>;
      options: PropTypes.Requireable<Json>;
    }>;
  }>;
}>;

export type Hook = (data: Json, next: (data?: Json) => Promise<Json>) => Promise<Json>;
export type FormEvent = 'loadNextStep' | 'loadedNextStep' | 'userAction' | 'submit' | 'error';

export interface UserAction {
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
export class Engine {
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
  private triggerHooks(eventName: FormEvent, data?: Json): Promise<Json>;

  /**
   * Updates list of generated steps.
   *
   * @param {number} stepIndex Index of the step to create or update.
   *
   * @param {Step} step Created or updated step.
   *
   * @returns {void}
   */
  private updateGeneratedSteps(stepIndex: number, step: Step): void;

  /**
   * Loads the next step with given id.
   *
   * @param {string | null} [nextStepId] Id of the next step to load.
   *
   * @returns {void}
   */
  private loadNextStep(nextStepId?: string | null): void;

  /**
   * Handles form submission and next step computation.
   *
   * @param {UserAction} userAction Last user action.
   *
   * @returns {void}
   */
  private handleSubmit(userAction: UserAction): void;

  /**
   * Handles user actions, applying core logic such as hooks triggering or next step generation.
   *
   * @param {UserAction | null} userAction New state sent by `userActions` store module.
   *
   * @returns {void}
   */
  private handleUserAction(userAction: UserAction | null): void;

  /**
   * Class constructor.
   *
   * @param {Configuration} configuration Form engine configuration.
   *
   * @returns {void}
   */
  constructor(configuration: Configuration);

  /**
   * Returns form's configuration.
   *
   * @returns {Configuration} Form's configuration.
   */
  public getConfiguration(): Configuration;

  /**
   * Generates field with the given id from configuration.
   *
   * @param {string} fieldId Field id.
   *
   * @returns {Field} Generated field.
   *
   * @throws {Error} If the field does not exist.
   */
  public createField(fieldId: string): Field;

  /**
   * Generates step with the given id from configuration.
   *
   * @param {string | null} stepId Step id.
   *
   * @returns {Step | null} Generated step, or `null`.
   *
   * @throws {Error} If the step does not exist.
   */
  public createStep(stepId: string | null): Step | null;

  /**
   * Retrieves form fields values that have been filled.
   *
   * @returns {FormValues} Form values.
   */
  public getValues(): FormValues;

  /**
   * Loads the given form fields values into current step.
   *
   * @param {FormValues} values Form values to load in form.
   *
   * @returns {void}
   */
  public loadValues(values: FormValues): void;

  /**
   * Returns current store instance.
   *
   * @returns {Store} Current store instance.
   */
  public getStore(): Store;

  /**
   * Returns index of the field with the given id.
   *
   * @param {string} fieldId Field's id.
   *
   * @returns {number} Field's index in current step.
   */
  public getFieldIndex(fieldId: string): number;

  /**
   * Returns current generated step.
   *
   * @returns {Step} Current generated step.
   */
  public getCurrentStep(): Step;

  /**
   * Updates current generated step with given info.
   *
   * @param {Step} updatedStep Updated info to set in current generated step.
   *
   * @param {boolean} [notify = false] Whether to notify all `steps` module's listeners.
   *
   * @returns {void}
   */
  public setCurrentStep(updatedStep: Step, notify?: boolean): void;

  /**
   * Registers a new hook for the given event.
   *
   * @param {FormEvent} eventName Name of the event to register hook for.
   *
   * @param {Hook} hook Hook to register.
   *
   * @returns {void}
   */
  public on(eventName: FormEvent, hook: Hook): void;

  /**
   * Toggles a loader right after current step, indicating next step is/not being generated.
   *
   * @param {boolean} display Whether to display step loader.
   *
   * @returns {void}
   */
  public toggleStepLoader(display: boolean): void;
}

declare module 'gincko' {
  export default Engine;
}

declare module 'gincko/react' {
  /**
   * Dynamic form.
   */
  export default function Form(props: PropTypes.InferProps<{
    activeStep: PropTypes.Requireable<string>;
    configuration: Configuration;
    customComponents: PropTypes.Requireable<{
      [x: string]: (...args: Json[]) => Json;
    }>;
  }>): JSX.Element;
}

declare module 'gincko/vue' {
  import Vue from 'vue';
  import { ExtendedVue } from 'vue/types/vue.d';

  /**
   * Dynamic form.
   */
  const Form: ExtendedVue<Vue, Generic, Generic, Generic, {
    activeStep: string;
    configuration: Configuration;
    customComponents: {
      [type: string]: (field: Field, onUserAction: (newValue: FormValue) => void) => {
        component: Vue.Component;
        props: Json;
        events: Json;
      };
    };
  }>;
  export default Form;
}
