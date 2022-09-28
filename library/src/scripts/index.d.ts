/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import BaseEngine from 'scripts/core/Engine';

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

declare global {
  type Fields = (Field | null)[];
  type NextHook<T> = (data: T) => Promise<T>;
  type Hook<T> = (data: T, next: NextHook<T>) => Promise<T>;
  type Status = 'initial' | 'progress' | 'error' | 'success';
  type FieldConfigurations = { [fieldId: string]: FieldConfiguration; };
  type HookData = UserInputs | Error | Step | UserAction | boolean | null;
  type OnUserAction = (type: string, path: string, data: UserInput) => void;
  type NestedFieldConfiguration = ObjectFieldConfiguration | ArrayFieldConfiguration;
  type SubConfiguration = Configuration | FieldConfiguration | StepConfiguration | null;
  type CustomComponent = (field: ExtendedField, onUserAction: OnUserAction) => unknown | null;

  interface CachedData {
    steps: Step[];
    variables: Variables;
    userInputs: UserInputs;
    fieldValues: UserInputs;
  }

  interface ExtendedField extends Field {
    i18n: I18n;
    path: string;
    isActive: boolean;
    variables: Variables;
    allValues: UserInputs;
    userInputs: UserInputs;
    customComponents: CustomComponents;
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
  export type ComponentProps = {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  /** User input. */
  export type UserInput = unknown;

  /** User inputs. */
  export type UserInputs = { [fieldId: string]: UserInput; };

  /** Form variables. */
  export type Variables = { [key: string]: unknown; };

  /** List of hooks events names. */
  export type FormEvent = 'start' | 'step' | 'afterStep' | 'userAction' | 'afterUserAction' | 'submit' | 'error';

  /** Internationalization function, used for labels translation. */
  export type I18n = (label: string, values?: Variables) => string;

  /** List of custom form components. */
  export type CustomComponents = Record<string, CustomComponent>;

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
    index: number;
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
    status: 'initial' | 'error' | 'progress' | 'success';
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

    /** Whether to validate fields only on step submission. */
    validateOnSubmit?: boolean;

    /** Whether to submit only updated fields values. */
    submitPartialUpdates?: boolean;

    /** Form's steps configurations. */
    steps: { [stepId: string]: StepConfiguration; };
  }

  /**
   * Form engine.
   */
  export class Engine extends BaseEngine {
    public on(eventName: 'userAction', hook: Hook<UserAction | null>): void;

    public on(eventName: 'afterUserAction', hook: Hook<UserAction | null>): void;

    public on(eventName: 'step', hook: Hook<Step | null>): void;

    public on(eventName: 'afterStep', hook: Hook<Step | null>): void;

    public on(eventName: 'error', hook: Hook<Error | null>): void;

    public on(eventName: 'submit', hook: Hook<UserInputs | null>): void;

    public on(eventName: 'start', hook: Hook<boolean | null>): void;
  }
}
