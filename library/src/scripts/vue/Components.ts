/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as biuty from 'biuty/vue';
import { vue } from 'scripts/index.d';
import MessageField from 'scripts/vue/MessageField.vue';
import NestedFields from 'scripts/vue/NestedFields.vue';

const nestedFields = (type: 'array' | 'object' | 'dynamicObject'): vue.CustomComponent => (
  function Nested(field, onUserAction) {
    const { componentProps } = field;
    const addButtonProps = {
      ...componentProps.addButtonProps,
      label: (componentProps.addButtonProps?.label !== undefined)
        ? field.i18n(componentProps.addButtonProps.label, field.allValues)
        : undefined,
    };
    const removeButtonProps = {
      ...componentProps.removeButtonProps,
      label: (componentProps.removeButtonProps?.label !== undefined)
        ? field.i18n(componentProps.removeButtonProps.label, field.allValues)
        : undefined,
    };
    const addTextfieldProps = {
      ...componentProps.addTextfieldProps,
      label: (componentProps.addTextfieldProps?.label !== undefined)
        ? field.i18n(componentProps.addTextfieldProps.label, field.allValues)
        : undefined,
      placeholder: (componentProps.addTextfieldProps?.placeholder !== undefined)
        ? field.i18n(componentProps.addTextfieldProps.placeholder, field.allValues)
        : undefined,
    };

    return ({
      component: NestedFields,
      props: {
        ...componentProps,
        type,
        onUserAction,
        t: field.i18n,
        addButtonProps,
        path: field.path,
        removeButtonProps,
        addTextfieldProps,
        label: field.label,
        value: field.value,
        fields: field.fields,
        helper: field.message,
        isActive: field.isActive,
        variables: field.variables,
        userInputs: field.userInputs,
        id: field.path.replace(/\./g, '__'),
        customComponents: field.customComponents,
        modifiers: `${field.status} ${componentProps.modifiers || ''}`,
      },
      events: {},
    });
  }
);

/**
 * Gincko built-in form components.
 */
export default {
  Array: nestedFields('array'),
  Object: nestedFields('object'),
  DynamicObject: nestedFields('dynamicObject'),
  Message(field) {
    const { componentProps } = field;
    return ({
      component: MessageField,
      props: {
        label: field.label,
        id: field.path.replace(/\./g, '__'),
        modifiers: `${field.status} ${componentProps.modifiers || ''}`,
      },
      events: {},
    });
  },
  Link(field) {
    const { componentProps } = field;
    return ({
      component: biuty.UILink,
      props: {
        ...componentProps,
        label: field.label || '',
        id: field.path.replace(/\./g, '__'),
        modifiers: `${field.status} ${componentProps.modifiers || ''}`,
      },
      events: {
        click: componentProps.onClick,
      },
    });
  },
  Button(field, onUserAction) {
    const { componentProps } = field;
    return ({
      component: biuty.UIButton,
      props: {
        ...componentProps,
        label: field.label,
        id: field.path.replace(/\./g, '__'),
        modifiers: `${field.status} ${componentProps.modifiers || ''}`,
      },
      events: {
        focus: componentProps.onFocus,
        click: (): void => onUserAction('input', field.path, true),
      },
    });
  },
  Options(field, onUserAction) {
    const { componentProps } = field;
    const translatedOptions = componentProps.options.map((option: biuty.Option) => {
      const { label, ...rest } = option;
      return {
        ...rest,
        label: (label !== undefined)
          ? field.i18n(label as unknown as string, field.allValues)
          : undefined,
      };
    });
    return ({
      component: biuty.UIOptions,
      props: {
        ...componentProps,
        name: field.path,
        label: field.label,
        value: field.value,
        helper: field.message,
        options: translatedOptions,
        id: field.path.replace(/\./g, '__'),
        modifiers: `${field.status} ${componentProps.modifiers || ''}`,
      },
      events: {
        focus: componentProps.onFocus,
        change: (newValue: string): void => onUserAction('input', field.path, newValue),
      },
    });
  },
  Textfield(field, onUserAction) {
    const { componentProps } = field;
    let debounceTimeout = 100;
    if (componentProps.debounceTimeout !== undefined) {
      debounceTimeout = componentProps.debounceTimeout;
    }
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : null;
    return ({
      component: biuty.UITextfield,
      props: {
        ...componentProps,
        placeholder,
        debounceTimeout,
        name: field.path,
        label: field.label,
        helper: field.message,
        id: field.path.replace(/\./g, '__'),
        readonly: componentProps.readonly || !field.isActive,
        modifiers: `${field.status} ${componentProps.modifiers || ''}`,
        value: field.value !== undefined && field.value !== null ? `${field.value}` : field.value,
      },
      events: {
        blur: componentProps.onBlur,
        paste: componentProps.onPaste,
        focus: componentProps.onFocus,
        keyDown: componentProps.onKeyDown,
        iconClick: componentProps.onIconClick,
        iconKeyDown: componentProps.onIconKeyDown,
        change: (value: string): void => onUserAction('input', field.path, value),
      },
    });
  },
  Date(field, onUserAction) {
    const { componentProps } = field;
    let debounceTimeout = 100;
    if (componentProps.debounceTimeout !== undefined) {
      debounceTimeout = componentProps.debounceTimeout;
    }
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : null;
    return ({
      component: biuty.UITextfield,
      props: {
        ...componentProps,
        maxlength: 10,
        placeholder,
        debounceTimeout,
        name: field.path,
        label: field.label,
        helper: field.message,
        id: field.path.replace(/\./g, '__'),
        transform: (value: string): [string] => {
          const cleaned = value.replace(/\D/g, '');
          const match1 = cleaned.match(/^(\d{4})$/);
          const match2 = cleaned.match(/^(\d{4})(\d{2})$/);
          const match3 = cleaned.match(/^(\d{4})(\d{2})(\d{2})$/);
          if (match1 && match1.length < 5) {
            return [`${match1[1]}/`];
          }
          if (match2 && match2.length < 8) {
            return [`${match2[1]}/${match2[2]}/`];
          }
          if (match3) {
            return [`${match3[1]}/${match3[2]}/${match3[3]}`];
          }
          return [value];
        },
        readonly: componentProps.readonly || !field.isActive,
        modifiers: `${field.status} ${componentProps.modifiers || ''}`,
        value: field.value !== undefined && field.value !== null
          ? (field.value as Date).toISOString().split('T')[0].replace(/-/g, '/')
          : field.value,
      },
      events: {
        focus: componentProps.onFocus,
        keyDown: (event: KeyboardEvent): void => {
          const keysRegExp = /(1|2|3|4|5|6|7|8|9|0|Backspace|Delete|ArrowRight|ArrowLeft|Tab|Enter)/;
          if (!keysRegExp.test(event.key) && !event.ctrlKey) {
            event.preventDefault();
          }
        },
        change: (value: string): void => {
          if (/^(\d{4})\/(\d{2})\/(\d{2})$/.test(value)) {
            const newDate = new Date(new Date(value).getTime() + 25 * 3600 * 1000);
            onUserAction('input', field.path, newDate.toISOString().split('T')[0].replace(/-/g, '/'));
          }
        },
      },
    });
  },
  Textarea(field, onUserAction) {
    const { componentProps } = field;
    let debounceTimeout = 100;
    if (componentProps.debounceTimeout !== undefined) {
      debounceTimeout = componentProps.debounceTimeout;
    }
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : null;
    return ({
      component: biuty.UITextarea,
      props: {
        ...componentProps,
        placeholder,
        debounceTimeout,
        name: field.path,
        label: field.label,
        helper: field.message,
        id: field.path.replace(/\./g, '__'),
        modifiers: `${field.status} ${componentProps.modifiers || ''}`,
        value: field.value !== undefined && field.value !== null ? `${field.value}` : field.value,
      },
      events: {
        blur: componentProps.onBlur,
        paste: componentProps.onPaste,
        focus: componentProps.onFocus,
        keyDown: componentProps.onKeyDown,
        iconClick: componentProps.onIconClick,
        iconKeyDown: componentProps.onIconKeyDown,
        readonly: componentProps.readonly || !field.isActive,
        change: (value: string): void => onUserAction('input', field.path, value),
      },
    });
  },
  FilePicker(field, onUserAction) {
    const { componentProps } = field;
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : null;
    return ({
      component: biuty.UIFilePicker,
      props: {
        ...componentProps,
        placeholder,
        name: field.path,
        label: field.label,
        value: field.value,
        helper: field.message,
        id: field.path.replace(/\./g, '__'),
        modifiers: `${field.status} ${componentProps.modifiers || ''}`,
      },
      events: {
        blur: componentProps.onBlur,
        paste: componentProps.onPaste,
        focus: componentProps.onFocus,
        keyDown: componentProps.onKeyDown,
        iconClick: componentProps.onIconClick,
        iconKeyDown: componentProps.onIconKeyDown,
        readonly: componentProps.readonly || !field.isActive,
        change: (value: File): void => onUserAction('input', field.path, value),
      },
    });
  },
} as vue.CustomComponents;
