/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'gincko/vue' {
  import type { DefineComponent } from 'vue';
  import type { FormProps, FieldProps } from 'gincko';

  export * from 'gincko';

  /**
   * Vue form field.
   */
  export const Field: DefineComponent<FieldProps>;

  /**
   * Vue form.
   */
  const Form: DefineComponent<FormProps, Record<string, unknown>, {
    /** UI component to use when loading steps. */
    loader: DefineComponent;
  }>;

  export default Form;
}
