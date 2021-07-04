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
export type Field = PropTypes.InferProps<{
  value: PropTypes.Requireable<FormValue>;
  active: PropTypes.Requireable<boolean>;
  label: PropTypes.Requireable<string>;
  message: PropTypes.Requireable<string>;
  id: PropTypes.Validator<string>;
  type: PropTypes.Validator<string>;
  status: PropTypes.Validator<string>;
  options: PropTypes.Validator<Json>;
}>;
export type Step = PropTypes.InferProps<{
  index: PropTypes.Requireable<number>;
  isActive: PropTypes.Requireable<boolean>;
  onUserAction: PropTypes.Requireable<(...args: FormValue[]) => Promise<FormValue>>;
  id: PropTypes.Validator<string>;
  status: PropTypes.Validator<string>;
  customComponents: PropTypes.Requireable<{
    [x: string]: (...args: Json[]) => Json;
  }>;
  fields: PropTypes.Validator<Field[]>;
}>;

export type Configuration = PropTypes.InferProps<{
  /** Form id, used to name cache key. */
  id: PropTypes.Requireable<string>;

  /** Whether to enable cache. */
  cache: PropTypes.Requireable<boolean>;

  /** Whether to enable fields autofill with existing values. */
  autoFill: PropTypes.Requireable<boolean>;

  /** Whether to restart form from the beginning on page reload. */
  restartOnReload: PropTypes.Requireable<boolean>;

  /** Root step, from which to start the form. */
  root: PropTypes.Validator<string>;

  /** Whether to check fields values only on step submit. */
  checkValuesOnSubmit: PropTypes.Requireable<boolean>;

  /** Custom plugins registrations. */
  plugins: PropTypes.Requireable<((...args: Json[]) => void)[]>;

  /** List of fields types in which to inject form values in options. */
  injectValuesTo: PropTypes.Requireable<string[]>;

  /** List of non-interactive fields types (message, ...) that will always pass to success state. */
  nonInteractiveFields: PropTypes.Requireable<string[]>;

  /** List of form steps. */
  steps: PropTypes.Validator<{
    [x: string]: PropTypes.InferProps<{
      /** List of step's fields ids. */
      fields: PropTypes.Validator<string[]>;

      /** Whether to submit form when step is complete. */
      submit: PropTypes.Requireable<boolean>;

      /** Determines which step to load next. */
      nextStep: PropTypes.Requireable<string | ((...args: FormValue[]) => string | null)>;
    }>;
  }>;

  /** List of form fields. */
  fields: PropTypes.Validator<{
    [x: string]: PropTypes.InferProps<{
      /** Field's type. */
      type: PropTypes.Validator<string>;

      /** Whether field is required. */
      required: PropTypes.Requireable<boolean>;

      /** Field's label. */
      label: PropTypes.Requireable<string>;

      /** Field's status-specific messages. */
      messages: PropTypes.Requireable<PropTypes.InferProps<{
        /** Message passed to the field when status is "success". */
        success: PropTypes.Requireable<string>;

        /** Message passed to the field when it is empty but required. */
        required: PropTypes.Requireable<string>;

        /** Returns a different message depending on validation rule. */
        validation: PropTypes.Requireable<(...args: FormValue[]) => string | null | undefined>;
      }>>;

      /** Field's default value. */
      value: PropTypes.Requireable<FormValue>;

      /** Field's options. */
      options: PropTypes.Requireable<Json>;

      /** Whether to load next step when performing a user action on this field. */
      loadNextStep: PropTypes.Requireable<boolean>;
    }>;
  }>;
}>;

export type Hook<Type> = (data: Type, next: (data?: Type) => Promise<Type>) => Promise<Type>;
export type FormEvent = 'loadNextStep' | 'loadedNextStep' | 'userAction' | 'submit' | 'error';

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
export class Engine {
  /** Diox store instance. */
  private store: Store;

  /** Cache name key. */
  private cacheKey: string;

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
   * Adds or overrides the given form values.
   *
   * @param {FormValues} values Form values to add.
   *
   * @returns {void}
   */
  public setValues(values: FormValues): void;

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
   * Returns current generated step index.
   *
   * @returns {number} Current generated step index.
   */
  public getCurrentStepIndex(): number;

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
   * @param {Hook<Json>} hook Hook to register.
   *
   * @returns {void}
   */
  public on(eventName: 'userAction', hook: Hook<UserAction | null>): void;

  public on(eventName: 'loadNextStep', hook: Hook<Step | null>): void;

  public on(eventName: 'loadedNextStep', hook: Hook<Step | null>): void;

  public on(eventName: 'error', hook: Hook<Error | null>): void;

  public on(eventName: 'submit', hook: Hook<FormValues | null>): void;

  /**
   * Toggles a loader right after current step, indicating next step is/not being generated.
   *
   * @param {boolean} display Whether to display step loader.
   *
   * @returns {void}
   */
  public toggleStepLoader(display: boolean): void;

  /**
   * Triggers the given user action.
   *
   * @param {UserAction} userAction User action to trigger.
   *
   * @returns {void}
   */
  public userAction(userAction: UserAction): void
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

declare module 'gincko/plugins' {
  /**
   * errorStepDisplayer plugin options.
   */
  interface ErrorStepDisplayerOptions {
    /** Id of the error step in the configuration. */
    stepId: string;

    /** Callback used to set active form step to the error step. */
    setActiveStep: (stepId: string) => void;
  }

  /**
   * Gracefully handles errors by displaying a generic error step.
   *
   * @param {ErrorStepDisplayerOptions} options Plugin options.
   *
   * @returns {Plugin} The actual gincko plugin.
   */
  export function errorStepDisplayer(options: ErrorStepDisplayerOptions): Plugin;

  /**
   * loaderDisplayer plugin options.
   */
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
  export function loaderDisplayer(options?: LoaderDisplayerOptions): Plugin;

  /**
   * reCaptchaHandler plugin options.
   */
  interface ReCaptchaHandlerOptions {
    /** Google's reCAPTCHA v3 site key. */
    siteKey: string;
  }

  /**
   * Automatically handles a reCAPTCHA challenge for current form.
   *
   * @param {ReCaptchaHandlerOptions} options Plugin's options.
   *
   * @returns {Plugin} The actual plugin.
   */
  export function reCaptchaHandler(options: ReCaptchaHandlerOptions): Plugin;

  /**
   * Handles steps' submitting fields states (disabled, loading, ...) depending on its status.
   *
   * @returns {Plugin} The actual gincko plugin.
   */
  export function submittingFieldsManager(): Plugin;
}
