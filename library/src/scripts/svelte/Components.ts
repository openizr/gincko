/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as biuty from 'biuty/svelte';
import Message from 'scripts/svelte/Message.svelte';
import NestedFields from 'scripts/svelte/NestedFields.svelte';

const nestedFields = (type: 'array' | 'object' | 'dynamicObject'): CustomComponent => (
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
      onFocus: componentProps.onFocus,
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
        fields: field.fields,
        helper: field.message,
        isActive: field.isActive,
        variables: field.variables,
        userInputs: field.userInputs,
        value: field.value ?? undefined,
        id: field.path.replace(/\./g, '__'),
        customComponents: field.customComponents,
        modifiers: `${field.status} ${componentProps.modifiers ?? ''}`,
      },
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
      component: Message,
      props: {
        label: field.label,
        id: field.path.replace(/\./g, '__'),
        modifiers: `${field.status} ${componentProps.modifiers ?? ''}`,
      },
    });
  },
  Link(field) {
    const { componentProps } = field;
    return ({
      component: biuty.UILink,
      props: {
        ...componentProps,
        label: field.label,
        id: field.path.replace(/\./g, '__'),
        modifiers: `${field.status} ${componentProps.modifiers ?? ''}`,
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
        modifiers: `${field.status} ${componentProps.modifiers ?? ''}`,
        onClick: (): void => onUserAction('input', field.path, true),
      },
    });
  },
  Options(field, onUserAction) {
    const { componentProps } = field;
    const translatedOptions = componentProps.options.map((option: biuty.Option) => {
      if (option.type === 'divider') {
        return option;
      }
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
        modifiers: `${field.status} ${componentProps.modifiers ?? ''}`,
        onChange: (value: string): void => onUserAction('input', field.path, value),
      },
    });
  },
  Textfield(field, onUserAction) {
    const { componentProps } = field;
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : undefined;
    return ({
      component: biuty.UITextfield,
      props: {
        ...componentProps,
        placeholder,
        name: field.path,
        label: field.label,
        helper: field.message,
        value: field.value ?? undefined,
        id: field.path.replace(/\./g, '__'),
        readonly: componentProps.readonly || !field.isActive,
        debounceTimeout: componentProps.debounceTimeout ?? 100,
        modifiers: `${field.status} ${componentProps.modifiers ?? ''}`,
        onChange: (value: string): void => onUserAction('input', field.path, value),
      },
    });
  },
  DatePicker(field, onUserAction) {
    const { componentProps } = field;
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : undefined;
    return ({
      component: biuty.UITextfield,
      props: {
        ...componentProps,
        maxlength: 10,
        placeholder,
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
        debounceTimeout: componentProps.debounceTimeout ?? 100,
        modifiers: `${field.status} ${componentProps.modifiers ?? ''}`,
        value: field.value !== null
          ? (field.value as Date).toISOString().split('T')[0].replace(/-/g, '/')
          : undefined,
        onKeyDown: (_value: string, event: KeyboardEvent): void => {
          const keysRegExp = /(1|2|3|4|5|6|7|8|9|0|Backspace|Delete|ArrowRight|ArrowLeft|Tab|Enter)/;
          if (!keysRegExp.test(event.key) && !event.ctrlKey) {
            event.preventDefault();
          }
        },
        onChange: (value: string): void => {
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
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : undefined;
    return ({
      component: biuty.UITextarea,
      props: {
        ...componentProps,
        placeholder,
        name: field.path,
        label: field.label,
        helper: field.message,
        value: field.value ?? undefined,
        id: field.path.replace(/\./g, '__'),
        readonly: componentProps.readonly || !field.isActive,
        debounceTimeout: componentProps.debounceTimeout ?? 100,
        modifiers: `${field.status} ${componentProps.modifiers ?? ''}`,
        onChange: (value: string): void => onUserAction('input', field.path, value),
      },
    });
  },
  FilePicker(field, onUserAction) {
    const { componentProps } = field;
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : undefined;
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
        readonly: componentProps.readonly || !field.isActive,
        modifiers: `${field.status} ${componentProps.modifiers ?? ''}`,
        onChange: (value: string): void => onUserAction('input', field.path, value),
      },
    });
  },
} as CustomComponents;
