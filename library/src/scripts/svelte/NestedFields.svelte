<!-- Nested fields (array / object / dynamicObject) form component. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Field from 'scripts/svelte/Field.svelte';
import { buildClass, UIButton, UITextfield } from 'biuty/svelte';

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

// Enforces props default values.
$: id = id || null;
$: value = value || null;
$: label = label || null;
$: helper = helper || null;
$: minItems = minItems || 0;
$: modifiers = modifiers || '';
$: isActive = isActive || false;
$: maxItems = maxItems || Infinity;
$: addButtonProps = addButtonProps || {};
$: allowedPatterns = allowedPatterns || [];
$: customComponents = customComponents || {};
$: addTextfieldProps = addTextfieldProps || {};
$: removeButtonProps = removeButtonProps || {};
$: addButtonPropsOnFocus = addButtonProps.onFocus as () => void;
$: addTextfieldPropsOnBlur = addTextfieldProps.onBlur as () => void;
$: addTextfieldPropsOnPaste = addTextfieldProps.onPaste as () => void;
$: addTextfieldPropsOnFocus = addTextfieldProps.onFocus as () => void;
$: removeButtonPropsOnFocus = removeButtonProps.onFocus as () => void;
$: addTextfieldPropsOnKeyDown = addTextfieldProps.onKeyDown as () => void;
$: addTextfieldPropsOnIconClick = addTextfieldProps.onIconClick as () => void;
$: addTextfieldPropsOnIconKeyDown = addTextfieldProps.onIconKeyDown as () => void;

let newKey = '';
let isInvalidPattern = false;
let currentValue: UserInputs | UserInput[] = (type === 'array') ? [] : {};
$: {
  if (value === null || value === undefined) {
    currentValue = (type === 'array') ? [] : {};
  } else {
    currentValue = value as UserInputs | UserInput[];
  }
}
$: isAddButtonDisabled = fields.length >= maxItems;
$: className = buildClass('ui-nested-fields', `${modifiers} ${type}`);
$: addButtonDisabledModifier = (
  isInvalidPattern
  || newKey === ''
  || (currentValue as UserInputs)[newKey] !== undefined
) ? 'disabled' : '';

const removeItem = (index: number) => () => {
  const valueKeys = Object.keys(currentValue);
  const newValue: UserInputs = Array.isArray(currentValue)
    ? currentValue.slice(0, index).concat(currentValue.slice(index + 1))
    : valueKeys.slice(0, index).concat(valueKeys.slice(index + 1)).reduce((finalValue, key) => ({
      ...finalValue,
      [key]: (currentValue as UserInputs)[key],
    }), {});
  onUserAction('input', path, newValue);
};

const addItem = () => {
  onUserAction('input', path, Array.isArray(currentValue)
    ? currentValue.concat([null])
    : { ...currentValue, [newKey]: null });
  newKey = '';
};

const handleChange = (details: {detail: { newValue: string; }; }) => {
  let noPatternMatch = true;
  newKey = details.detail.newValue;
  for (let index = 0, { length } = allowedPatterns; index < length; index += 1) {
    if (allowedPatterns[index].test(newKey)) {
      noPatternMatch = false;
    }
  }
  isInvalidPattern = noPatternMatch;
};

// Adds new fields if length does not fit minimum length.
$: {
  const arrayValue = currentValue as UserInput[];
  if (type === 'array' && arrayValue.length < minItems) {
    onUserAction('input', path, arrayValue.concat(new Array(minItems - arrayValue.length).fill(null)));
  }
}

// Removes extra fields if length does not fit maximum length.
$: {
  const arrayValue = currentValue as UserInput[];
  if (type === 'array' && arrayValue.length > maxItems) {
    onUserAction('input', path, arrayValue.slice(0, maxItems));
  }
}
</script>

<div {id} class={className}>
  {#if label !== null}
    <span class="ui-nested-fields__label">{label}</span>
  {/if}

  {#each fields as field, index (`${path}.${field?.id}`)}
    {#if field !== null}
      <div class="ui-nested-fields__field">
        {#if type === 'dynamicObject'}
          <span class="ui-nested-fields__field__label">{field.id}</span>
        {/if}
        {#if type !== 'object' && fields.length > minItems}
          <UIButton
            icon={removeButtonProps.icon}
            label={removeButtonProps.label}
            modifiers={removeButtonProps.modifiers}
            iconPosition={removeButtonProps.iconPosition}
            on:click={removeItem(index)}
            on:focus={removeButtonPropsOnFocus}
          />
        {/if}
        <Field
          {field}
          i18n={t}
          {isActive}
          {variables}
          {userInputs}
          {onUserAction}
          {customComponents}
          path={`${path}.${field.id}`}
        />
      </div>
    {/if}
  {/each}

  {#if type !== 'object'}
    <div class="ui-nested-fields__add">
      {#if type === 'dynamicObject' && !isAddButtonDisabled}
        <UITextfield
          value={newKey}
          name={`${id}-add`}
          readonly={!isActive}
          icon={addTextfieldProps.icon}
          label={addTextfieldProps.label}
          modifiers={addTextfieldProps.modifiers}
          autofocus={addTextfieldProps.autofocus}
          transform={addTextfieldProps.transform}
          maxlength={addTextfieldProps.maxlength}
          allowedKeys={addTextfieldProps.allowedKeys}
          placeholder={addTextfieldProps.placeholder}
          autocomplete={addTextfieldProps.autocomplete}
          iconPosition={addTextfieldProps.iconPosition}
          helper={isInvalidPattern ? addTextfieldProps.helper : undefined}
          debounceTimeout={(addTextfieldProps.debounceTimeout !== undefined)
            ? addTextfieldProps.debounceTimeout
            : 100}
          on:change={handleChange}
          on:blur={addTextfieldPropsOnBlur}
          on:paste={addTextfieldPropsOnPaste}
          on:focus={addTextfieldPropsOnFocus}
          on:keyDown={addTextfieldPropsOnKeyDown}
          on:iconClick={addTextfieldPropsOnIconClick}
          on:iconKeyDown={addTextfieldPropsOnIconKeyDown}
        />
      {/if}
      {#if !isAddButtonDisabled}
        <UIButton
          on:click={addItem}
          icon={addButtonProps.icon}
          label={addButtonProps.label}
          on:focus={addButtonPropsOnFocus}
          iconPosition={addButtonProps.iconPosition}
          modifiers={`${addButtonDisabledModifier} ${addButtonProps.modifiers || ''}`}
        />
      {/if}
    </div>
  {/if}

  {#if helper !== null}
    <span class="ui-nested-fields__helper">{helper}</span>
  {/if}
</div>
