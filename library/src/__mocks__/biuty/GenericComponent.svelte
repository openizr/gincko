<!-- biuty component mock. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export let t:unknown | undefined = undefined;
export let path:unknown | undefined = undefined;
export let type:unknown | undefined = undefined;
export let variables:unknown | undefined = undefined;
export let userInputs:unknown | undefined = undefined;
export let onUserAction:unknown | undefined = undefined;
export let maxlength:unknown | undefined = undefined;
export let modifiers:unknown | undefined = undefined;
export let readonly :unknown | undefined = undefined;
export let debounceTimeout :unknown | undefined = undefined;
export let value: unknown | undefined = undefined;
export let id: unknown | undefined = undefined;
export let name: unknown | undefined = undefined;
export let label: unknown | undefined = undefined;
export let helper: unknown | undefined = undefined;
export let options: unknown | undefined = undefined;
export let autocomplete: unknown | undefined = undefined;
export let iconPosition: unknown | undefined = undefined;
export let allowedKeys: unknown | undefined = undefined;
export let autofocus: unknown | undefined = undefined;
export let icon: unknown | undefined = undefined;
export let placeholder: unknown | undefined = undefined;
export let transform: ((value: string) => string) | undefined = undefined;
export let onChange: ((value: string) => void) | undefined = vi.fn();
export let onClick: (() => void) | undefined = vi.fn();
export let onFocus: (() => void) | undefined = vi.fn();
export let onBlur: (() => void) | undefined = vi.fn();
export let onKeyDown: ((value: string, event: unknown) => void) | undefined = vi.fn();

// Covers `onChange` handler.
setTimeout(() => {
  onChange?.('test');
  if (process.env.IS_DATE === 'true') {
    onChange?.('2020/02/20');
  }
}, 10);

// Covers `onFocus` handler.
onFocus?.();

// Covers `onBlur` handler.
onBlur?.();

// Covers `onClick` handler.
setTimeout(() => {
  onClick?.();
}, 10);

// Covers `transform` function.
transform?.('ok');
transform?.('1002');
transform?.('100220');
transform?.('10022020');

// Covers `onKeyDown` handler.
onKeyDown?.('', { key: '1' });
onKeyDown?.('', { key: 'A', ctrlKey: false, preventDefault: vi.fn() });
</script>

<div>
  {t}
  {path}
  {type}
  {variables}
  {userInputs}
  {onUserAction}
  {name}
  {label}
  {value}
  {placeholder}
  {helper}
  {debounceTimeout}
  {id}
  {readonly}
  {modifiers}
  {typeof transform}
  {maxlength}
  {onFocus}
  {options}
  {autocomplete}
  {icon}
  {iconPosition}
  {autofocus}
  {allowedKeys}
</div>
