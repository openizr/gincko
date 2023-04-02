/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module 'gincko/react' {
  import 'react';
  import type { FormProps, FieldProps } from 'gincko';

  export * from 'gincko';

  /**
   * React form field.
   */
  export function Field(props: FieldProps): JSX.Element;

  /**
   * React form.
   */
  export default function Form(props: FormProps & {
    /** UI component to use when loading steps. */
    loader?: JSX.Element | null;
  }): JSX.Element;
}
