/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'gincko' {
  import Store from 'diox';

  type Fields = (Field | null)[];
  type NextHook<T> = (data: T) => Promise<T>;
  type Hook<T> = (data: T, next: NextHook<T>) => Promise<T>;
  type FieldConfigurations = { [fieldId: string]: FieldConfiguration; };
  type HookData = UserInputs | Error | Step | UserAction | boolean | null;
  type OnUserAction = (type: string, path: string, data: UserInput) => void;
  type NestedFieldConfiguration = ObjectFieldConfiguration | ArrayFieldConfiguration;
  type SubConfiguration = Configuration | FieldConfiguration | StepConfiguration | null;
  type CustomComponent = (field: ExtendedField, onUserAction: OnUserAction) => Any | null;

  interface ExtendedField extends Field {
    /** Internationalization function, used for labels translation. */
    i18n: I18n;

    /** Field's path. */
    path: string;

    /** Whether field belongs to the active step. */
    isActive: boolean;

    /** Form variables. */
    variables: Variables;

    /** Form variables and user inputs merged all together for dynamic labelling.  */
    allValues: UserInputs;

    /** List of user inputs. */
    userInputs: UserInputs;

    /** List of registered custom form components. */
    customComponents: CustomComponents;
  }

  interface CachedData {
    steps: Step[];
    variables: Variables;
    userInputs: UserInputs;
    fieldValues: UserInputs;
  }

  /** Field's status-specific messages. */
  interface FieldMessages {
    /** Message passed to the field when status is "success". */
    success?: string;

    /** Message passed to the field when it is empty but required. */
    required?: string;
  }

  /** Field configuration's common properties. */
  interface GenericFieldConfiguration {
    type: string;
    messages?: FieldMessages;

    /** Whether field is required. */
    required?: boolean;

    /** Field's label. */
    label?: string;

    /** Field's default value. */
    defaultValue?: UserInput;

    /** Whether to submit current step when performing a user action on this field. */
    submit?: boolean;

    /** Name of the UI component to use for rendering field. */
    component: string;

    /** Additional props that will be passed to the field's component. */
    componentProps?: ComponentProps;

    /** Condition on which field will actually be created and displayed. */
    renderCondition?: (inputs: UserInputs, variables: Variables) => boolean;
  }

  /** Null field configuration. */
  interface NullFieldConfiguration extends Omit<GenericFieldConfiguration, 'submit' | 'messages'> {
    /** Field's type. */
    type: 'null';
  }

  /** String field configuration. */
  interface StringFieldConfiguration extends GenericFieldConfiguration {
    /** Field's type. */
    type: 'string';

    /** Field's status-specific messages. */
    messages?: FieldMessages & {
      /** Returns a different message depending on validation rule. */
      validation?: (value: string, inputs: UserInputs, variables: Variables) => string | null;
    };
  }

  /** Integer field configuration. */
  interface IntegerFieldConfiguration extends GenericFieldConfiguration {
    /** Field's type. */
    type: 'integer';

    /** Field's status-specific messages. */
    messages?: FieldMessages & {
      /** Returns a different message depending on validation rule. */
      validation?: (value: number, inputs: UserInputs, variables: Variables) => string | null;
    };
  }

  /** Float field configuration. */
  interface FloatFieldConfiguration extends GenericFieldConfiguration {
    /** Field's type. */
    type: 'float';

    /** Field's status-specific messages. */
    messages?: FieldMessages & {
      /** Returns a different message depending on validation rule. */
      validation?: (value: number, inputs: UserInputs, variables: Variables) => string | null;
    };
  }

  /** Date field configuration. */
  interface DateFieldConfiguration extends GenericFieldConfiguration {
    /** Field's type. */
    type: 'date';

    /** Field's status-specific messages. */
    messages?: FieldMessages & {
      /** Returns a different message depending on validation rule. */
      validation?: (value: Date, inputs: UserInputs, variables: Variables) => string | null;
    };
  }

  /** Binary field configuration. */
  interface BinaryFieldConfiguration extends GenericFieldConfiguration {
    /** Field's type. */
    type: 'binary';

    /** Field's status-specific messages. */
    messages?: FieldMessages & {
      /** Returns a different message depending on validation rule. */
      validation?: (value: File, inputs: UserInputs, variables: Variables) => string | null;
    };
  }

  /** Boolean field configuration. */
  interface BooleanFieldConfiguration extends GenericFieldConfiguration {
    /** Field's type. */
    type: 'boolean';

    /** Field's status-specific messages. */
    messages?: FieldMessages & {
      /** Returns a different message depending on validation rule. */
      validation?: (value: boolean, inputs: UserInputs, variables: Variables) => string | null;
    };
  }

  /** Array field configuration. */
  interface ArrayFieldConfiguration extends Omit<GenericFieldConfiguration, 'value' | 'submit'> {
    /** Field's type. */
    type: 'array';

    /** Field's sub-fields configurations. */
    fields: FieldConfiguration;

    /** Field's status-specific messages. */
    messages?: FieldMessages & {
      /** Returns a different message depending on validation rule. */
      validation?: (
        value: (Field | null)[],
        inputs: UserInputs,
        variables: Variables,
      ) => string | null;
    };
  }

  /** Object field configuration. */
  interface ObjectFieldConfiguration extends Omit<GenericFieldConfiguration, 'value' | 'submit'> {
    /** Field's type. */
    type: 'object' | 'dynamicObject';

    /** Field's sub-fields configurations. */
    fields: FieldConfigurations;

    /** Field's status-specific messages. */
    messages?: FieldMessages & {
      /** Returns a different message depending on validation rule. */
      validation?: (
        value: (Field | null)[],
        inputs: UserInputs,
        variables: Variables,
      ) => string | null;
    };
  }

  /** Field's component additional props. */
  export type ComponentProps = { [key: string]: unknown };

  /** User input. */
  export type UserInput = unknown;

  /** User inputs. */
  export type UserInputs = { [fieldId: string]: UserInput; };

  /** Form variables. */
  export type Variables = { [key: string]: unknown };

  /** List of hooks events names. */
  export type FormEvent = 'start' | 'step' | 'afterStep' | 'userAction' | 'afterUserAction' | 'submit' | 'error';

  /** Internationalization function, used for labels translation. */
  export type I18n = (label: string, values?: Variables) => string;

  /** List of custom form components. */
  export type CustomComponents = Record<string, CustomComponent>;

  /**
   * Form cache.
   */
  export interface Cache {
    /** Stores `value` at `key` in cache. */
    set(key: string, value: unknown): Promise<void>;

    /** Fetches value at `key` from cache. */
    get(key: string): Promise<unknown>;

    /** Deletes value at `key` from cache. */
    delete(key: string): Promise<void>;
  }

  /** Custom form plugin. */
  export type Plugin = (engine: Engine) => void;

  /**
   * Form user action.
   */
  export interface UserAction {
    type: string;
    path: string;
    data: UserInput;
  }

  /**
   * Generated step.
   */
  export interface Step {
    id: string;
    fields: (Field | null)[];
    status: 'initial' | 'error' | 'progress' | 'success';
  }

  /**
   * Generated field.
   */
  export interface Field {
    id: string;
    label?: string;
    fields?: Fields;
    message?: string;
    value?: UserInput;
    component: string;
    fieldIds?: (string | number)[];
    componentProps: ComponentProps;
    status: 'initial' | 'error' | 'success';
  }

  /**
   * Form field configuration.
   */
  export type FieldConfiguration = (
    NullFieldConfiguration |
    StringFieldConfiguration |
    IntegerFieldConfiguration |
    FloatFieldConfiguration |
    BooleanFieldConfiguration |
    BinaryFieldConfiguration |
    DateFieldConfiguration |
    ArrayFieldConfiguration |
    ObjectFieldConfiguration
  );

  /**
   * Form step configuration.
   */
  export interface StepConfiguration {
    /** Step's fields configurations. */
    fields: FieldConfigurations;

    /** Whether to submit form when step is complete. */
    submit?: boolean;

    /** Determines which step to load next. */
    nextStep?: string | ((inputs: UserInputs, variables: Variables) => string);
  }

  /**
   * Form configuration.
   */
  export interface Configuration {
    /** Form's id (used as a cache id). */
    id?: string;

    /** Root step. */
    root: string;

    /** Whether to automatically fill fields with existing inputs when loading steps. */
    autoFill?: boolean;

    /** List of custom plugins to register to the current form instance. */
    plugins?: Plugin[];

    /** Set of initial variables. */
    variables?: Variables;

    /** Cache instance to use. */
    cache?: Cache | null;

    /** Whether to restart form from the beginning when reloading the page. */
    restartOnReload?: boolean;

    /** Initial form values to fill fields with. */
    initialValues?: UserInputs;

    /** Whether to clear form cache on submit. */
    clearCacheOnSubmit?: boolean;

    /** Whether to submit only updated fields values. */
    submitPartialUpdates?: boolean;

    /** Form's steps configurations. */
    steps: { [stepId: string]: StepConfiguration; };
  }

  /**
   * Form engine.
   */
  export default class Engine {
    /** Diox store instance. */
    protected store: Store;

    /** Cache client. */
    protected cache: Cache | null;

    /** Form cache key. */
    protected cacheKey: string;

    /** Timeout after which to refresh cache. */
    protected cacheTimeout: number | null;

    /** Form engine configuration. */
    protected configuration: Configuration;

    /** Contains all events hooks to trigger when events are fired. */
    protected hooks: { [eventName: string]: Hook<HookData>[] };

    /** Whether next step is being loaded. */
    protected isLoading: boolean;

    /** Contains the actual form steps, as they are currently rendered to end-user. */
    protected steps: Step[];

    /** Contains all user inputs (whether related fields are rendered or not). */
    protected userInputs: UserInputs;

    /** Contains user-defined variables, accessible anywhere, anytime in the form. */
    protected variables: Variables;

    /** A reference to the current step, for faster access. */
    protected currentStep: Step | null;

    /** Mutations queuing timeout. */
    protected mutationTimeout: number | null;

    /**
     * Checks whether `input` is considered as empty, according to its type.
     *
     * @param {UserInput} input Input to check.
     *
     * @param {string} type Input's type.
     *
     * @returns {boolean} `true` if `input` is empty, `false` otherwise.
     */
    protected isEmpty(input: UserInput, type: string): boolean;

    /**
     * Checks whether `firstInput` and `secondInput` are equal, according to their type.
     *
     * @param {UserInput} firstInput First input to compare.
     *
     * @param {UserInput} secondInput Second input to compare.
     *
     * @param {string} type Inputs' type.
     *
     * @returns {boolean} `true` if `firstInput` and `secondInput` are equal, `false` otherwise.
     */
    protected areEqual(firstInput: UserInput, secondInput: UserInput, type: string): boolean;

    /**
     * Adds the given mutation and related data into the queue. "Buffering" mutations is an
     * optimization that prevents UI from being notified (and thus re-rendered) too many times per
     * second, which would be unecessary and not great UX-wise.
     *
     * @param {string} mutation Mutation name for the `state` module.
     *
     * @param {StateState | boolean} data Mutation data.
     *
     * @returns {void}
     */
    protected enqueueMutation(mutation: string, data: Step[] | boolean): void;

    /**
     * Returns the first dynamic object's pattern that matches `fieldId`.
     *
     * @param {string} fieldId Field's id to match against patterns.
     *
     * @param {NestedFieldConfiguration} configuration Dynamic object's configuration.
     *
     * @returns {string} First matching pattern, if it exists, `null` otherwise.
     */
    protected getPattern(fieldId: string, configuration: NestedFieldConfiguration): string | null;

    /**
     * Removes any functions from generated steps. Most of the time, JS functions cannot be stored
     * in cache, which is why we need to mangle them before caching form steps, and to add them back
     * when fetching form steps from cache.
     *
     * @param {Step[]} steps Steps to mangle functions from.
     *
     * @returns {Step[]} Steps without functions.
     */
    protected withoutFunctions(steps: Step[]): Step[];

    /**
     * Merges configuration and generated fields' `componentProps`. Most of the time, JS functions
     * cannot be stored in cache, which is why we need to mangle them before caching form steps, and
     * to add them back when fetching form steps from cache.
     *
     * @param {Fields} fields Form fields to add functions to.
     *
     * @param {FieldConfigurations} fieldConfigurations Configuration to retrieve functions from.
     *
     * @returns {Fields} Fields with functions.
     */
    protected withFunctions(fields: Fields, fieldConfigurations: FieldConfigurations): Fields;

    /**
     * Filters user inputs, keeping only the ones for rendered fields.
     *
     * @param {boolean} partial Whether to keep only updated inputs, or all inputs.
     *
     * @param {Field | null} field Current field to get input from.
     *
     * @param {FieldConfiguration} fieldConfiguration Current field's configuration.
     *
     * @param {UserInput} currentInitialInput Current initial input.
     *
     * @param {UserInput} filteredInputs Current filtered input.
     *
     * @returns {void}
     */
    protected filterInputs(
      partial: boolean,
      field: Field | null,
      fieldConfiguration: FieldConfiguration,
      currentInitialInput: UserInput,
      filteredInputs: UserInput,
    ): void;

    /**
     * Generates field with path `path` from its configuration `fieldConfiguration`.
     *
     * @param {string} path Field path.
     *
     * @param {FieldConfiguration} fieldConfiguration Field configuration.
     *
     * @returns {Field} Generated field.
     */
    protected createField(path: string, fieldConfiguration: FieldConfiguration): Field;

    /**
     * Coerces user inputs into proper types and performs some type checks on user actions.
     *
     * @param {UserInput} userInput User input to coerce and check.
     *
     * @param {string} type Type to use for coercion and checking.
     *
     * @returns {Promise<UserInput>} Coerced user input.
     */
    protected coerceAndCheckInput(userInput: UserInput, type: string): Promise<UserInput>;

    /**
     * Performs a deep comparison between `newValue` and `field`'s value and returns a list of user
     * actions that must be triggered to reflect subsequent changes.
     *
     * @param {Field | null} field Field to compate `newValue` with.
     *
     * @param {UserInput} newValue New value to compare.
     *
     * @param {FieldConfiguration} fieldConfiguration Field's configuration.
     *
     * @param {string} path Current field's path.
     *
     * @param {boolean} [isRoot = true] Whether current field is the root field (used internally).
     *
     * @returns {UserAction[]} List of user actions that must be triggered.
     */
    protected deepCompare(
      field: Field | null,
      newValue: UserInput,
      fieldConfiguration: FieldConfiguration,
      path: string,
      isRoot?: boolean,
    ): UserAction[];

    /**
     * Toggles field at `path`, according to its rendering condition.
     *
     * @param {string} path Field's path.
     *
     * @param {Fields} parent Field's parent.
     *
     * @param {number} fieldIndex Field's index in its parent's fields list.
     *
     * @param {FieldConfiguration} configuration Field's configuration.
     *
     * @param {UserInput} currentValues Current inputs to update field's value with.
     *
     * @returns {void}
     */
    protected toggleField(
      path: string,
      parent: Fields,
      fieldIndex: number,
      configuration: FieldConfiguration,
      currentValues: UserInput,
    ): void;

    /**
     * Validates `field`, making sure that its value passes all validation rules.
     *
     * @param {Field | null} field Field to validate.
     *
     * @param {FieldConfiguration} configuration Field configuration.
     *
     * @param {boolean} partial Whether to also validate empty fields.
     *
     * @returns {string} Field's state ("progress", "success" or "error").
     */
    protected validateField(
      field: Field | null,
      configuration: FieldConfiguration,
      partial: boolean,
    ): string;

    /**
     * Toggles all fields and sub-fields for `step`, according to their rendering conditions.
     *
     * @param {Step | null} step Step to toggle fields for.
     *
     * @returns {void}
     */
    protected toggleFields(step: Step | null): void;

    /**
     * Validates current step, making sure that all its fields' values pass validation rules.
     *
     * @param {boolean} [partial = false] Whether to also validate empty fields.
     *
     * @returns {void}
     */
    protected validateFields(partial?: boolean): void;

    /**
     * Returns the list of gincko field/step's configurations for each part of `path`. If no path is
     * provided, a list containing only the global form configuration is returned instead.
     *
     * @param {string} [path] Field/step's path to get configurations for.
     *
     * @returns {SubConfiguration[]} Array of gincko configurations for each part of `path`.
     */
    protected getConfigurations(path?: string): SubConfiguration[];

    /**
     * Inserts or updates `userInput` at `path` in the inputs store.
     *
     * @param {string} path Path to insert/update user input at in the inputs store.
     *
     * @param {UserInput} userInput User input to store. If `undefined`, existing value at `path`
     * will be deleted instead of updated.
     *
     * @returns {void}
     */
    protected setInput(path: string, userInput: UserInput): void;

    /**
     * Triggers hooks chain for the given event.
     *
     * @param {FormEvent} eventName Event's name.
     *
     * @param {HookData} data Additional data to pass to the hooks chain.
     *
     * @returns {Promise<HookData>} Pending hooks chain.
     */
    protected triggerHooks<T extends HookData>(eventName: FormEvent, data: T): Promise<T>;

    /**
     * Updates form's cached data.
     *
     * @returns {void}
     */
    protected updateCache(): void;

    /**
     * Updates list of generated steps.
     *
     * @param {number} stepIndex Index of the step to create or update.
     *
     * @param {Step} step Created or updated step.
     *
     * @returns {Promise<void>}
     */
    protected updateSteps(stepIndex: number, step: Step): Promise<void>;

    /**
     * Handles form submission and next step generation.
     *
     * @returns {Promise<void>}
     */
    protected handleSubmit(): Promise<void>;

    /**
     * Handles new user actions, applying core logic such as hooks triggering or next step
     * generation.
     *
     * @param {UserAction | null} userAction New state sent by `userActions` store module.
     *
     * @returns {Promise<void>}
     */
    protected handleUserAction(userAction: UserAction | null): Promise<void>;

    /**
     * Class constructor.
     *
     * @param {Configuration} configuration Form engine configuration.
     *
     * @returns {void}
     */
    constructor(configuration: Configuration);

    /**
     * Generates step with id `stepId`.
     *
     * @param {string | null} [stepId] Step id.
     *
     * @returns {Step} Generated step.
     */
    public createStep(stepId?: string | null): Promise<void>;

    /**
     * Toggles a loader right after current step, indicating next step is/not being generated.
     *
     * @param {boolean} display Whether to display step loader.
     *
     * @returns {void}
     */
    public toggleLoader(display: boolean): void;

    /**
     * Returns current store instance.
     *
     * @returns {Store} Current store instance.
     */
    public getStore(): Store;

    /**
     * Forces a new notification to all `state` module's listeners.
     *
     * @returns {void}
     */
    public forceUpdate(): void;

    /**
     * Registers a new hook for the given event.
     *
     * @param {FormEvent} eventName Name of the event to register hook for.
     *
     * @param {Hook<HookData>} hook Hook to register.
     *
     * @returns {void}
     */
    public on(eventName: FormEvent, hook: Hook<HookData>): void;

    /**
     * Triggers the given user action.
     *
     * @param {UserAction} userAction User action to trigger.
     *
     * @returns {void}
     */
    public userAction(userAction: UserAction): void;

    /**
     * Retrieves current user inputs at `path`. If no path is given, returns all user inputs.
     *
     * @param {string} [path] Input path.
     *
     * @returns {UserInputs | UserInput | null} User inputs if they exist, `null` otherwise.
     */
    public getInputs(path?: string): UserInputs | UserInput | null;

    /**
     * Returns gincko field/step's configuration for `path`. If no path is provided, the global form
     * configuration is returned instead.
     *
     * @param {string} [path] Field/step's path to get configuration for.
     *
     * @returns {SubConfiguration} Gincko configuration.
     */
    public getConfiguration(path?: string): SubConfiguration;

    /**
     * Returns the generated field at `path`.
     *
     * @param {string} path Path of the field to get, in the current generated form.
     *
     * @returns {Field | null} Generated field if it exists, `null` otherwise.
     */
    public getField(path: string): Field | null;

    /**
     * Returns all generated steps.
     *
     * @returns {Step[]} Current step.
     */
    public getSteps(): Step[];

    /**
     * Returns current step.
     *
     * @returns {Step | null} Current step.
     */
    public getCurrentStep(): Step | null;

    /**
     * Retrieves current form variables.
     *
     * @returns {Variables} Form variables.
     */
    public getVariables(): Variables;

    /**
     * Adds or overrides the given form variables.
     *
     * @param variables Form variables to add or override.
     */
    public setVariables(variables: Variables): void;

    /**
     * Clears current form cache.
     *
     * @returns {Promise<void>}
     */
    public clearCache(): Promise<void>;
  }
}
