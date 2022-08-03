<!-- gincko/svelte/NestedFields mock. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

 interface ButtonProps {
  icon?: string;
  label?: string;
  modifiers?: string;
  iconPosition?: 'left' | 'right';
  onFocus?: (event: FocusEvent) => void;
}

interface TextfieldProps {
  icon?: string;
  label?: string;
  helper?: string;
  modifiers?: string;
  autofocus?: boolean;
  maxlength?: number;
  placeholder?: string;
  debounceTimeout?: number;
  autocomplete?: 'on' | 'off';
  iconPosition?: 'left' | 'right';
  onIconClick?: (event: MouseEvent) => void;
  onIconKeyDown?: (event: KeyboardEvent) => void;
  onPaste?: (event: ClipboardEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  transform?: (value: string, selectionStart: number) => [string, number?];
  onBlur?: (value: string, event: FocusEvent) => void;
  onFocus?: (value: string, event: FocusEvent) => void;
  allowedKeys?: {
    altKey?: RegExp;
    metaKey?: RegExp;
    ctrlKey?: RegExp;
    default?: RegExp;
    shiftKey?: RegExp;
  };
}

export let t: I18n;
export let path: string;
export let fields: Fields;
export let minItems = 0;
export let modifiers = '';
export let isActive = false;
export let maxItems = Infinity;
export let variables: Variables;
export let userInputs: UserInputs;
export let id: string | null = null;
export let onUserAction: OnUserAction;
export let label: string | null = null;
export let helper: string | null = null;
export let allowedPatterns: RegExp[] = [];
export let addButtonProps: ButtonProps = {};
export let removeButtonProps: ButtonProps = {};
export let addTextfieldProps: TextfieldProps = {};
export let customComponents: CustomComponents = {};
export let type: 'array' | 'object' | 'dynamicObject';
export let value: UserInputs | UserInput[] | null = null;

</script>

<div id="field">
  {JSON.stringify({
    t,
    id,
    path,
    fields,
    minItems,
    modifiers,
    isActive,
    maxItems,
    variables,
    userInputs,
    onUserAction,
    label,
    helper,
    allowedPatterns,
    addButtonProps,
    removeButtonProps,
    addTextfieldProps,
    type,
    value,
    customComponents,
  })}
</div>
