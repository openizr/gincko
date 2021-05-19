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
  Json,
  Field,
  Generic,
  FormValue,
} from 'scripts/types';
import {
  UIRadio,
  UIButton,
  markdown,
  buildClass,
  UIDropdown,
  UICheckbox,
  UITextfield,
  UIFileUploader,
} from 'sonar-ui/vue';
import Vue from 'vue';
import { ExtendedVue } from 'vue/types/vue.d';

type Components = { [type: string]: Component; };
type Component = (field: Field, onUserAction: (newValue: FormValue) => void) => Json;

interface Props {
  id: string;
  type: string;
  label: string;
  status: string;
  message: string;
  value: FormValue;
  options: Json;
  active: boolean;
  customComponents: {
    [type: string]: (field: Field, onUserAction: (newValue: FormValue) => void) => {
      name: string;
      props: Json;
      events: Json;
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
      // We perform dynamic form values injection into message if necessary.
      let content = this.label || '';
      Object.keys(this.options.formValues || {}).forEach((key) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), this.options.formValues[key]);
      });
      return markdown(content, false);
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
      click: (): void => onUserAction(field.id),
    },
  }),
  Textfield: (field, onUserAction) => ({
    name: 'UITextfield',
    props: {
      id: field.id,
      name: field.id,
      label: field.label,
      value: field.value,
      min: field.options.min,
      max: field.options.max,
      step: field.options.step,
      icon: field.options.icon,
      size: field.options.size,
      type: field.options.type,
      readonly: field.options.readonly || field.active === false,
      maxlength: field.options.maxlength,
      placeholder: field.options.placeholder,
      iconPosition: field.options.iconPosition,
      helper: field.message || field.options.helper,
      modifiers: `${field.status} ${field.options.modifiers || ''} `,
    },
    events: {
      change: onUserAction,
      focus: field.options.onFocus,
      blur: field.options.onBlur,
      iconClick: field.options.onIconClick,
    },
  }),
  FileUploader: (field, onUserAction) => ({
    name: 'UIFileUploader',
    props: {
      id: field.id,
      name: field.id,
      label: field.label,
      value: field.value,
      icon: field.options.icon,
      placeholder: field.options.placeholder,
      iconPosition: field.options.iconPosition,
      helper: field.message || field.options.helper,
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
      icon: field.options.icon,
      options: field.options.options,
      multiple: field.options.multiple,
      helper: field.message || field.options.helper,
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
      options: field.options.options,
      helper: field.message || field.options.helper,
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
      options: field.options.options,
      helper: field.message || field.options.helper,
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
    UITextfield,
    UIFileUploader,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    type: {
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
    message: {
      type: String,
      required: false,
      default: '',
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
    component() {
      // Unknown field type...
      if (this.allComponents[this.type] === undefined) {
        return null;
      }
      // Registered field type...
      return this.allComponents[this.type]({
        id: this.id,
        label: this.label,
        type: this.type,
        options: { ...this.options, onFocus: this.focusField },
        message: this.message,
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
      this.$emit('userAction', this.id, { type: 'input', value: newValue });
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
