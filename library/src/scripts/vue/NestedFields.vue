<!-- Nested fields (array / object / dynamicObject) form component. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ref, computed, watch } from 'vue';
import FormField from 'scripts/vue/FormField.vue';
import { buildClass, UIButton, UITextfield } from 'biuty/vue';

type MouseEventHandler = (event: MouseEvent) => void;
type KeyboardEventHandler = (event: KeyboardEvent) => void;
type ClipboardEventHandler = (event: ClipboardEvent) => void;
type FocusEventHandler = (value: string, event: FocusEvent) => void;
type Transform = (value: string, selectionStart: number) => [string, number?];

const props = defineProps<{
  id?: string;
  path: string;
  t: I18n;
  fields: Fields;
  label?: string;
  helper?: string;
  isActive?: boolean;
  modifiers?: string;
  addButtonProps?: {
    icon?: string;
    label?: string;
    modifiers?: string;
    iconPosition?: 'left' | 'right';
    onFocus?: MouseEventHandler;
  };
  removeButtonProps?: {
    icon?: string;
    label?: string;
    modifiers?: string;
    iconPosition?: 'left' | 'right';
    onFocus?: MouseEventHandler;
  };
  addTextfieldProps?: {
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
    onIconClick?: MouseEventHandler;
    onIconKeyDown?: KeyboardEventHandler;
    onPaste?: ClipboardEventHandler;
    onKeyDown?: KeyboardEventHandler;
    transform?: Transform;
    onBlur?: FocusEventHandler;
    onFocus?: FocusEventHandler;
    allowedKeys?: {
      altKey?: RegExp;
      metaKey?: RegExp;
      ctrlKey?: RegExp;
      default?: RegExp;
      shiftKey?: RegExp;
    };
  };
  minItems?: number;
  maxItems?: number;
  variables: Variables;
  userInputs: UserInputs;
  allowedPatterns?: RegExp[];
  onUserAction: OnUserAction;
  customComponents?: CustomComponents;
  type: 'array' | 'object' | 'dynamicObject';
  value?: { [key: string]: UserInput; } | UserInput[] | null;
}>();

const newKey = ref('');
const isInvalidPattern = ref(false);
const defaultArrayValue: UserInput[] = [];
const defaultObjectValue: UserInputs = {};
const value = computed(() => {
  if (props.value === null || props.value === undefined) {
    return (props.type === 'array') ? defaultArrayValue : defaultObjectValue;
  }
  return props.value as UserInputs | UserInput[];
});
const className = computed(() => buildClass('ui-nested-fields', [
  props.modifiers || '',
  props.type,
].join(' ')));
const isAddButtonDisabled = computed(() => {
  const maxItems = (props.maxItems !== undefined) ? props.maxItems : Infinity;
  return props.fields.length >= maxItems;
});
const addButtonDisabledModifier = computed(() => {
  const keyExistsOrIsEmpty = newKey.value === '' || value.value[newKey.value] !== undefined;
  return (isInvalidPattern.value || (props.type === 'dynamicObject' && keyExistsOrIsEmpty)) ? 'disabled' : '';
});

const removeItem = (index: number) => {
  const valueKeys = Object.keys(value.value);
  const newValue: UserInputs = Array.isArray(value.value)
    ? value.value.slice(0, index).concat(value.value.slice(index + 1))
    : valueKeys.slice(0, index).concat(valueKeys.slice(index + 1)).reduce((finalValue, key) => ({
      ...finalValue,
      [key]: value.value[key],
    }), {});
  props.onUserAction('input', props.path, newValue);
};

const addItem = () => {
  props.onUserAction('input', props.path, Array.isArray(value.value)
    ? value.value.concat([null])
    : { ...value.value, [newKey.value]: null });
  newKey.value = '';
};

const handleChange = (newValue: string) => {
  let noPatternMatch = true;
  newKey.value = newValue;
  const allowedPatterns = props.allowedPatterns || [];
  for (let index = 0, { length } = allowedPatterns; index < length; index += 1) {
    if (allowedPatterns[index].test(newValue)) {
      noPatternMatch = false;
    }
  }
  isInvalidPattern.value = noPatternMatch;
};

// Adds new fields if length does not fit minimum length.
watch(() => [value, props.minItems], () => {
  const minItems = props.minItems || 0;
  const currentLength = value.value.length;
  if (props.type === 'array' && currentLength < minItems) {
    props.onUserAction('input', props.path, value.value.concat(new Array(minItems - currentLength).fill(null)));
  }
});

// Removes extra fields if length does not fit maximum length.
watch(() => [value, props.maxItems], () => {
  const currentLength = value.value.length;
  const maxItems = (props.maxItems !== undefined) ? props.maxItems : Infinity;
  if (props.type === 'array' && currentLength > maxItems) {
    props.onUserAction('input', props.path, value.value.slice(0, maxItems));
  }
});
</script>

<template>
  <div
    :id="id"
    :class="className"
  >
    <span
      v-if="label !== undefined"
      class="ui-nested-fields__label"
    >{{ label }}</span>

    <div
      v-for="(field, index) in fields.filter((field) => field !== null)"
      :key="`${path}.${field.id}`"
      class="ui-nested-fields__field"
    >
      <span
        v-if="type === 'dynamicObject'"
        class="ui-nested-fields__field__label"
      >{{ field.id }}</span>

      <UIButton
        v-if="type !== 'object' && fields.length > (minItems || 0)"
        type="button"
        :icon="removeButtonProps?.icon"
        :label="removeButtonProps?.label"
        :modifiers="removeButtonProps?.modifiers"
        :icon-position="removeButtonProps?.iconPosition"
        @click="removeItem(index, $event)"
        @focus="removeButtonProps?.onFocus"
      />
      <FormField
        :i18n="t"
        :field="field"
        :is-active="isActive"
        :variables="variables"
        :user-inputs="userInputs"
        :path="`${path}.${field.id}`"
        :on-user-action="onUserAction"
        :custom-components="customComponents"
      />
    </div>

    <div
      v-if="type !== 'object'"
      class="ui-nested-fields__add"
    >
      <UITextfield
        v-if="type === 'dynamicObject' && !isAddButtonDisabled"
        :value="newKey"
        :name="`${id}-add`"
        :readonly="!isActive"
        :icon="addTextfieldProps?.icon"
        :label="addTextfieldProps?.label"
        :modifiers="addTextfieldProps?.modifiers"
        :autofocus="addTextfieldProps?.autofocus"
        :transform="addTextfieldProps?.transform"
        :maxlength="addTextfieldProps?.maxlength"
        :allowed-keys="addTextfieldProps?.allowedKeys"
        :placeholder="addTextfieldProps?.placeholder"
        :autocomplete="addTextfieldProps?.autocomplete"
        :icon-position="addTextfieldProps?.iconPosition"
        :helper="isInvalidPattern ? addTextfieldProps?.helper : undefined"
        :debounce-timeout="(addTextfieldProps?.debounceTimeout !== undefined)
          ? addTextfieldProps?.debounceTimeout
          : 100"
        @change="handleChange"
        @blur="addTextfieldProps?.onBlur"
        @paste="addTextfieldProps?.onPaste"
        @focus="addTextfieldProps?.onFocus"
        @keydown="addTextfieldProps?.onKeyDown"
        @icon-click="addTextfieldProps?.onIconClick"
        @icon-key-down="addTextfieldProps?.onIconKeyDown"
      />
      <UIButton
        v-if="!isAddButtonDisabled"
        type="button"
        :icon="addButtonProps?.icon"
        :label="addButtonProps?.label"
        :on-focus="addButtonProps?.onFocus"
        :icon-position="addButtonProps?.iconPosition"
        :modifiers="`${addButtonDisabledModifier} ${addButtonProps?.modifiers || ''}`"
        @click="addItem"
      />
    </div>
    <span
      v-if="helper !== undefined"
      class="ui-nested-fields__helper"
    >{{ helper }}</span>
  </div>
</template>
