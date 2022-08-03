/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'gincko/svelte' {
  import {
    I18n,
    Variables,
    UserInputs,
    OnUserAction,
    Configuration,
    CustomComponents,
    Field as GeneratedField,
  } from 'gincko';
  import type Engine from 'gincko';
  import type { SvelteComponentTyped } from 'svelte';

  export * from 'gincko';

  /**
   * Svelte form field.
   */
  export class Field extends SvelteComponentTyped<{
    field: GeneratedField;
    path: string;
    i18n: I18n;
    isActive: boolean;
    variables: Variables;
    userInputs: UserInputs;
    onUserAction: OnUserAction;
    customComponents: CustomComponents;
  }> { }

  /**
   * Svelte form.
   */
  export default class Form extends SvelteComponentTyped<{
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
  }, Record<string, unknown>, {
    /** UI component to use when loading steps. */
    loader: Any;
  }> { }
}
