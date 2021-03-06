/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Store from 'diox';
import * as PropTypes from 'prop-types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export type AnyValue = any;
export type Plugin = (engine: Engine) => void;
export type Field = PropTypes.InferProps<{
  value: PropTypes.Requireable<AnyValue>;
  active: PropTypes.Requireable<boolean>;
  label: PropTypes.Requireable<string>;
  message: PropTypes.Requireable<string>;
  id: PropTypes.Validator<string>;
  type: PropTypes.Validator<string>;
  status: PropTypes.Validator<string>;
  options: PropTypes.Validator<Record<string, any>>;
  allValues: PropTypes.Requireable<Record<string, any>>;
  i18n: PropTypes.Requireable<(label: string, values?: Record<string, string>) => string>;
}>;
export type Step = PropTypes.InferProps<{
  index: PropTypes.Requireable<number>;
  isActive: PropTypes.Requireable<boolean>;
  onUserAction: PropTypes.Requireable<(...args: AnyValue[]) => Promise<AnyValue>>;
  id: PropTypes.Validator<string>;
  status: PropTypes.Validator<string>;
  customComponents: PropTypes.Requireable<{
    [x: string]: (...args: any[]) => any;
  }>;
  fields: PropTypes.Validator<Field[]>;
  allValues: PropTypes.Requireable<Record<string, any>>;
  i18n: PropTypes.Requireable<(label: string, values?: Record<string, string>) => string>;
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

  /** Whether to clear cache on form submit. */
  clearCacheOnSubmit: PropTypes.Requireable<boolean>,

  /** Root step, from which to start the form. */
  root: PropTypes.Validator<string>;

  /** List of initial form variables. */
  variables: PropTypes.Requireable<any>,

  /** Whether to check fields values only on step submit. */
  checkValuesOnSubmit: PropTypes.Requireable<boolean>;

  /** Custom plugins registrations. */
  plugins: PropTypes.Requireable<((...args: any[]) => void)[]>;

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
      nextStep: PropTypes.Requireable<string | ((...args: AnyValue[]) => string | null)>;
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
        validation: PropTypes.Requireable<(...args: AnyValue[]) => string | null | undefined>;
      }>>;

      /** Field's default value. */
      value: PropTypes.Requireable<AnyValue>;

      /** Field's options. */
      options: PropTypes.Requireable<Record<string, any>>;

      /** Whether to load next step when performing a user action on this field. */
      loadNextStep: PropTypes.Requireable<boolean>;

      /** Create and display this field only if the given condition is met. */
      displayIf: PropTypes.Requireable<(values: AnyValues) => boolean>;
    }>;
  }>;
}>;

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
export class Engine {
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
   * @param {FormEvent} eventName Event's name.
   *
   * @param {AnyValues | Error | Step | UserAction | null} [data = undefined] Additional data
   * to pass to the hooks chain.
   *
   * @returns {Promise<AnyValues | Error | Step | UserAction | null>} Pending hooks chain.
   *
   * @throws {Error} If any event hook does not return a Promise.
   */
  private triggerHooks(eventName: 'start', data: undefined | null): Promise<undefined | null>;

  private triggerHooks(eventName: 'submit', data: AnyValues | null): Promise<AnyValues | null>;

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
   * Updates form's cached data.
   *
   * @returns {Promise<void>}
   */
  private async updateCache(): Promise<void>;

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
   * @returns {Step | null} Current generated step.
   */
  public getCurrentStep(): Step | null;

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
   * @param {Hook<AnyValues | Error | Step | UserAction | undefined | null>} hook Hook to register.
   *
   * @returns {void}
   */
  public on(eventName: 'start', hook: Hook<undefined | null>): void;

  public on(eventName: 'userAction', hook: Hook<UserAction | null>): void;

  public on(eventName: 'loadNextStep', hook: Hook<Step | null>): void;

  public on(eventName: 'loadedNextStep', hook: Hook<Step | null>): void;

  public on(eventName: 'error', hook: Hook<Error | null>): void;

  public on(eventName: 'submit', hook: Hook<AnyValues | null>): void;

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
  public userAction(userAction: UserAction): void;

  /**
   * Retrieves current form fields values.
   *
   * @returns {AnyValues} Form values.
   */
  public getValues(): AnyValues;

  /**
   * Clears current form cache.
   *
   * @returns {Promise<void>}
   */
  public async clearCache(): Promise<void>;

  /**
   * Retrieves current form variables.
   *
   * @returns {AnyValues} Form variables.
   */
  public getVariables(): AnyValues;

  /**
   * Adds or overrides the given form variables.
   *
   * @param {AnyValues} variables Form variables to add or override.
   *
   * @returns {void}
   */
  public setVariables(variables: AnyValues): void;
}

declare module 'gincko' {
  export default Engine;
}

declare module 'gincko/react' {
  type OUA = (type: 'click' | 'input', newValue: AnyValue) => void;

  /** Custom React component. */
  export type Component = (field: Field & { i18n: I18n; }, onUserAction: OUA) => JSX.Element;

  /** Custom React components. */
  export type Components = { [type: string]: Component; };

  /**
   * Dynamic form.
   */
  export default function Form(props: PropTypes.InferProps<{
    /** Form's active step's id. */
    activeStep: PropTypes.Requireable<string>;

    /** Form's configuration. */
    configuration: Configuration;

    /** Internationalization function, used to translate form labels into different languages. */
    i18n: PropTypes.Requireable<(label: string, values?: Record<string, string>) => string>;

    /** List of form's custom components. */
    customComponents: PropTypes.Requireable<{
      [x: string]: Component;
    }>;
  }>): JSX.Element;
}

declare module 'gincko/vue' {
  import Vue from 'vue';
  import { ExtendedVue } from 'vue/types/vue.d';

  type OUA = (type: 'click' | 'input', newValue: AnyValue) => void;

  /**
   * Dynamic form.
   */
  const Form: ExtendedVue<Vue, any, any, any, {
    /** Form's active step's id. */
    activeStep: string;

    /** Form's configuration. */
    configuration: Configuration;

    /** Internationalization function, used to translate form labels into different languages. */
    i18n: (label: string, values?: Record<string, string>) => string;

    /** List of form's custom components. */
    customComponents: {
      [type: string]: (field: Field, onUserAction: OUA) => {
        component: Vue.Component;
        props: any;
        events: any;
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
