/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'gincko/svelte' {
  import type { SvelteComponentTyped } from 'svelte';
  import type { FormProps, FieldProps } from 'gincko';

  export * from 'gincko';

  /**
   * Svelte form field.
   */
  export class Field extends SvelteComponentTyped<FieldProps> { }

  /**
   * Svelte form.
   */
  export default class Form extends SvelteComponentTyped<FormProps, Record<string, unknown>, {
    /** UI component to use when loading steps. */
    loader: SvelteComponentTyped;
  }> { }
}
