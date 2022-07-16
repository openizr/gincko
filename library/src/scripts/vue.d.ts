/* eslint-disable */

/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'gincko/vue' {
  import type {
    Field,
    Variables,
    UserInputs,
    OnUserAction,
    Configuration,
  } from 'gincko/core';
  import type Engine from 'gincko/core';

  export * from 'gincko/core';

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

  type CustomComponent = (field: ExtendedField, onUserAction: OnUserAction) => JSX.Element | null;

  /** Internationalization function, used for labels translation. */
  export type I18n = (label: string, values?: Variables) => string;

  /** List of custom form components. */
  export type CustomComponents = Record<string, CustomComponent>;

  export { Engine };

  /**
   * React form field.
   */
  export function Field(props: {
    field: Field;
    path: string;
    i18n: I18n;
    isActive: boolean;
    variables: Variables;
    userInputs: UserInputs;
    onUserAction: OnUserAction;
    customComponents: CustomComponents;
  }): JSX.Element | null;

  /**
   * React form.
   */
  export default function Form(props: {
    /** Form's active step's id. */
    activeStep?: string | null;

    /** Form's configuration. */
    configuration: Configuration,

    /** Internationalization function, used to translate form labels into different languages. */
    i18n?: I18n;

    /** List of form's custom UI components. */
    customComponents?: CustomComponents;

    /** Custom gincko form engine class to use instead of the default engine. */
    engineClass?: Engine;

    /** UI component to use when loading steps. */
    loader?: JSX.Element | null;
  }): JSX.Element | null;
}
