/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'gincko/react' {
  import 'react';
  import type Engine from 'gincko';
  import {
    I18n,
    Variables,
    UserInputs,
    OnUserAction,
    Configuration,
    CustomComponents,
    Field as GeneratedField,
  } from 'gincko';

  export * from 'gincko';

  /**
   * React form field.
   */
  export function Field(props: {
    /** Generated field. */
    field: GeneratedField;

    /** Field's path. */
    path: string;

    /** Internationalization function, used for labels translation. */
    i18n: I18n;

    /** Whether field belongs to the active step. */
    isActive: boolean;

    /** Form variables. */
    variables: Variables;

    /** List of user inputs. */
    userInputs: UserInputs;

    /** Callback to trigger at each user action. */
    onUserAction: OnUserAction;

    /** List of form's custom UI components. */
    customComponents: CustomComponents;
  }): JSX.Element;

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
  }): JSX.Element;
}
