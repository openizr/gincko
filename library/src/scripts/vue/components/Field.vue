<template>
  <component
    :is="component.name"
    v-if="component !== null"
    v-bind="component.props"
    v-on="Object.keys(component.events).reduce((events, event) => (
      (component.events[event] !== undefined)
        ? { ...events, [event]: component.events[event] }
        : events
    ), {})"
  />
</template>

<script lang="ts">
/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable vue/one-component-per-file */

import {
  UIRadio,
  UIButton,
  markdown,
  buildClass,
  UIDropdown,
  UICheckbox,
  UITextarea,
  UITextfield,
  UIFileUploader,
} from 'sonar-ui/vue';
import Vue from 'vue';
import { ExtendedVue } from 'vue/types/vue.d';
import { Field } from 'scripts/propTypes/field';
import { FormValue } from 'scripts/core/Engine';

type Generic = Record<string, FormValue>;
type Components = { [type: string]: Component; };
type Component = (field: Field, onUserAction: (newValue: FormValue) => void) => FormValue;

interface Props {
  id: string;
  type: string;
  label: string;
  status: string;
  message: string;
  value: FormValue;
  options: FormValue;
  active: boolean;
  i18n: (label: string, values?: Record<string, string>) => string;
  customComponents: {
    [type: string]: (field: Field, onUserAction: (newValue: FormValue) => void) => {
      name: string;
      props: FormValue;
      events: FormValue;
    };
  };
}

Vue.component('Message', {
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: '',
    },
    status: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
  },
  computed: {
    content(): string {
      return markdown(this.label || '', false);
    },
    className() {
      return buildClass('ui-message', `${this.status} ${this.options.modifiers || ''}`.split(' '));
    },
  },
  render(createElement) {
    return createElement('section', {
      attrs: {
        id: this.id,
        class: this.className,
      },
      domProps: {
        innerHTML: this.content,
      },
    });
  },
}) as ExtendedVue<Vue, Generic, Generic, Generic, Generic>;

/**
 * Built-in form components.
 */
const builtInComponents: Components = {
  Message: (field) => ({
    name: 'Message',
    props: {
      id: field.id,
      label: field.label,
      status: field.status,
      options: field.options,
    },
    events: {},
  }),
  Button: (field, onUserAction) => ({
    name: 'UIButton',
    props: {
      id: field.id,
      label: field.label,
      icon: field.options.icon,
      type: field.options.type,
      modifiers: `${field.status} ${field.options.modifiers || ''} `,
      iconPosition: field.options.iconPosition,
    },
    events: {
      click: (): void => onUserAction(true),
    },
  }),
  Textfield: (field, onUserAction) => ({
    name: 'UITextfield',
    props: {
      id: field.id,
      name: field.id,
      label: field.label,
      value: field.value,
      helper: field.message,
      min: field.options.min,
      max: field.options.max,
      step: field.options.step,
      icon: field.options.icon,
      size: field.options.size,
      type: field.options.type,
      readonly: field.options.readonly || field.active === false,
      transform: field.options.transform,
      maxlength: field.options.maxlength,
      placeholder: (field.options.placeholder !== undefined && field.options.placeholder !== null)
        ? (field.i18n as FormValue)(field.options.placeholder, field.options.formValues)
        : null,
      iconPosition: field.options.iconPosition,
      debounceTimeout: field.options.debounceTimeout || 100,
      modifiers: `${field.status} ${field.options.modifiers || ''} `,
    },
    events: {
      change: onUserAction,
      focus: field.options.onFocus,
      blur: field.options.onBlur,
      iconClick: field.options.onIconClick,
    },
  }),
  Textarea: (field, onUserAction) => ({
    name: 'UITextarea',
    props: {
      id: field.id,
      name: field.id,
      label: field.label,
      value: field.value,
      helper: field.message,
      cols: field.options.cols,
      rows: field.options.rows,
      transform: field.options.transform,
      maxlength: field.options.maxlength,
      placeholder: (field.options.placeholder !== undefined && field.options.placeholder !== null)
        ? (field.i18n as FormValue)(field.options.placeholder, field.options.formValues)
        : null,
      autocomplete: field.options.autocomplete,
      debounceTimeout: field.options.debounceTimeout || 100,
      readonly: field.options.readonly || field.active === false,
      modifiers: `${field.status} ${field.options.modifiers || ''}`,
    },
    events: {
      change: onUserAction,
      focus: field.options.onFocus,
      blur: field.options.onBlur,
    },
  }),
  FileUploader: (field, onUserAction) => ({
    name: 'UIFileUploader',
    props: {
      id: field.id,
      name: field.id,
      label: field.label,
      value: field.value,
      helper: field.message,
      icon: field.options.icon,
      placeholder: (field.options.placeholder !== undefined && field.options.placeholder !== null)
        ? (field.i18n as FormValue)(field.options.placeholder, field.options.formValues)
        : null,
      iconPosition: field.options.iconPosition,
      modifiers: `${field.status} ${field.options.modifiers || ''}`,
    },
    events: {
      change: onUserAction,
      focus: field.options.onFocus,
    },
  }),
  Dropdown: (field, onUserAction) => ({
    name: 'UIDropdown',
    props: {
      id: field.id,
      name: field.id,
      label: field.label,
      value: field.value,
      helper: field.message,
      icon: field.options.icon,
      options: field.options.options.map((option: FormValue) => ((option.label !== undefined)
        ? ({ ...option, label: field.i18n(option.label, field.options.formValues) })
        : option)),
      multiple: field.options.multiple,
      modifiers: `${field.status} ${field.options.modifiers || ''}`,
    },
    events: {
      change: onUserAction,
      focus: field.options.onFocus,
    },
  }),
  Checkbox: (field, onUserAction) => ({
    name: 'UICheckbox',
    props: {
      id: field.id,
      name: field.id,
      label: field.label,
      value: field.value,
      helper: field.message,
      options: field.options.options.map((option: FormValue) => ((option.label !== undefined)
        ? ({ ...option, label: field.i18n(option.label, field.options.formValues) })
        : option)),
      modifiers: `${field.status} ${field.options.modifiers || ''}`,
    },
    events: {
      change: onUserAction,
      focus: field.options.onFocus,
    },
  }),
  Radio: (field, onUserAction) => ({
    name: 'UIRadio',
    props: {
      id: field.id,
      name: field.id,
      label: field.label,
      value: field.value,
      helper: field.message,
      options: field.options.options.map((option: FormValue) => ((option.label !== undefined)
        ? ({ ...option, label: field.i18n(option.label, field.options.formValues) })
        : option)),
      modifiers: `${field.status} ${field.options.modifiers || ''}`,
    },
    events: {
      change: onUserAction,
      focus: field.options.onFocus,
    },
  }),
};

/**
 * Form field.
 */
export default Vue.extend<Generic, Generic, Generic, Props>({
  components: {
    UIRadio,
    UIButton,
    UIDropdown,
    UICheckbox,
    UITextarea,
    UITextfield,
    UIFileUploader,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    i18n: {
      type: Function,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: undefined,
    },
    status: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
      default: undefined,
    },
    value: { // eslint-disable-line vue/require-prop-types
      required: false,
      default: undefined,
    },
    options: {
      type: Object,
      required: true,
    },
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    customComponents: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data() {
    return {
      isActive: this.active,
    };
  },
  computed: {
    allComponents() {
      return { ...builtInComponents, ...this.customComponents };
    },
    translatedLabel() {
      return (this.label !== undefined && this.label !== null)
        ? this.i18n(this.label, this.options.formValues)
        : null;
    },
    translatedMessage() {
      const helper = this.message || this.options.helper;
      return (helper !== undefined && helper !== null)
        ? this.i18n(helper, this.options.formValues)
        : null;
    },
    component() {
      // Unknown field type...
      if (this.allComponents[this.type] === undefined) {
        return null;
      }
      // Registered field type...
      return this.allComponents[this.type]({
        id: this.id,
        i18n: this.i18n,
        label: this.translatedLabel,
        type: this.type,
        options: { ...this.options, onFocus: this.focusField },
        message: this.translatedMessage,
        active: this.isActive,
        value: this.value,
        status: this.status,
      }, this.onUserAction);
    },
  },
  watch: {
    active() {
      this.isActive = this.active;
    },
  },
  methods: {
    onUserAction(newValue: FormValue): void {
      this.$emit('userAction', { fieldId: this.id, type: 'input', value: newValue });
    },
    focusField(focusedValue: FormValue): void {
      this.isActive = true;
      if (this.options.onFocus !== undefined) {
        this.options.onFocus(focusedValue);
      }
    },
  },
});
</script>
