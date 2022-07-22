/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import * as biuty from 'biuty/react';
import Message from 'scripts/react/Message';
import NestedFields from 'scripts/react/NestedFields';

const nestedFields = (type: 'array' | 'object' | 'dynamicObject'): CustomComponent => (
  function Nested(field, onUserAction): JSX.Element {
    const { componentProps } = field;
    const addButtonProps = {
      ...componentProps.addButtonProps,
      label: (componentProps.addButtonProps?.label !== undefined)
        ? field.i18n(componentProps.addButtonProps.label, field.allValues)
        : null,
    };
    const removeButtonProps = {
      ...componentProps.removeButtonProps,
      label: (componentProps.removeButtonProps?.label !== undefined)
        ? field.i18n(componentProps.removeButtonProps.label, field.allValues)
        : null,
    };
    const addTextfieldProps = {
      ...componentProps.addTextfieldProps,
      label: (componentProps.addTextfieldProps?.label !== undefined)
        ? field.i18n(componentProps.addTextfieldProps.label, field.allValues)
        : null,
      placeholder: (componentProps.addTextfieldProps?.placeholder !== undefined)
        ? field.i18n(componentProps.addTextfieldProps.placeholder, field.allValues)
        : null,
    };
    const JSXNestedFields = NestedFields as JSXElement;
    return (
      <JSXNestedFields
        type={type}
        t={field.i18n}
        path={field.path}
        label={field.label}
        helper={field.message}
        isActive={field.isActive}
        variables={field.variables}
        onUserAction={onUserAction}
        userInputs={field.userInputs}
        fields={field.fields as Fields}
        addButtonProps={addButtonProps}
        value={field.value as UserInput[]}
        maxItems={componentProps.maxItems}
        minItems={componentProps.minItems}
        id={field.path.replace(/\./g, '__')}
        removeButtonProps={removeButtonProps}
        addTextfieldProps={addTextfieldProps}
        customComponents={field.customComponents}
        allowedPatterns={componentProps.allowedPatterns}
        modifiers={`${field.status} ${componentProps.modifiers || ''}`}
      />
    );
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
    const JSXMessage = Message as JSXElement;
    return (
      <JSXMessage
        label={field.label}
        id={field.path.replace(/\./g, '__')}
        modifiers={`${field.status} ${componentProps.modifiers || ''}`}
      />
    );
  },
  Link(field) {
    const { componentProps } = field;
    const JSXUILink = biuty.UILink as JSXElement;
    return (
      <JSXUILink
        label={field.label || ''}
        rel={componentProps.rel}
        href={componentProps.href}
        target={componentProps.target}
        onClick={componentProps.onClick}
        id={field.path.replace(/\./g, '__')}
        modifiers={`${field.status} ${componentProps.modifiers || ''}`}
      />
    );
  },
  Button(field, onUserAction) {
    const { componentProps } = field;
    return (
      <biuty.UIButton
        label={field.label}
        type={componentProps.type}
        icon={componentProps.icon}
        onFocus={componentProps.onFocus}
        id={field.path.replace(/\./g, '__')}
        iconPosition={componentProps.iconPosition}
        onClick={(): void => onUserAction('input', field.path, true)}
        modifiers={`${field.status} ${componentProps.modifiers || ''}`}
      />
    );
  },
  Options(field, onUserAction) {
    const { componentProps } = field;
    const translatedOptions = componentProps.options.map((option: biuty.Option) => {
      const { label, ...rest } = option;
      return {
        ...rest,
        label: (label !== undefined)
          ? field.i18n(label as unknown as string, field.allValues)
          : null,
      };
    });
    return (
      <biuty.UIOptions
        name={field.path}
        label={field.label}
        helper={field.message}
        value={`${field.value}`}
        options={translatedOptions}
        select={componentProps.select}
        onFocus={componentProps.onFocus}
        multiple={componentProps.multiple}
        id={field.path.replace(/\./g, '__')}
        modifiers={`${field.status} ${componentProps.modifiers || ''}`}
        onChange={(newValue): void => onUserAction('input', field.path, newValue)}
      />
    );
  },
  Textfield(field, onUserAction) {
    const { componentProps } = field;
    const debounceTimeout = (componentProps.debounceTimeout !== undefined)
      ? componentProps.debounceTimeout
      : 100;
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : null;
    const JSXTextfield = biuty.UITextfield as JSXElement;
    return (
      <JSXTextfield
        name={field.path}
        label={field.label}
        helper={field.message}
        min={componentProps.min}
        max={componentProps.max}
        placeholder={placeholder}
        step={componentProps.step}
        icon={componentProps.icon}
        size={componentProps.size}
        type={componentProps.type}
        onBlur={componentProps.onBlur}
        onPaste={componentProps.onPaste}
        onFocus={componentProps.onFocus}
        debounceTimeout={debounceTimeout}
        id={field.path.replace(/\./g, '__')}
        onKeyDown={componentProps.onKeyDown}
        maxlength={componentProps.maxlength}
        transform={componentProps.transform}
        autofocus={componentProps.autofocus}
        allowedKeys={componentProps.allowedKeys}
        onIconClick={componentProps.onIconClick}
        autocomplete={componentProps.autocomplete}
        iconPosition={componentProps.iconPosition}
        onIconKeyDown={componentProps.onIconKeyDown}
        readonly={componentProps.readonly || !field.isActive}
        modifiers={`${field.status} ${componentProps.modifiers || ''}`}
        onChange={(value: string): void => onUserAction('input', field.path, value)}
        value={field.value !== undefined && field.value !== null ? `${field.value}` : field.value}
      />
    );
  },
  DatePicker(field, onUserAction) {
    const { componentProps } = field;
    const debounceTimeout = (componentProps.debounceTimeout !== undefined)
      ? componentProps.debounceTimeout
      : 100;
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : null;
    const JSXTextfield = biuty.UITextfield as JSXElement;
    return (
      <JSXTextfield
        maxlength={10}
        name={field.path}
        label={field.label}
        helper={field.message}
        placeholder={placeholder}
        min={componentProps.min}
        max={componentProps.max}
        step={componentProps.step}
        icon={componentProps.icon}
        size={componentProps.size}
        type={componentProps.type}
        onBlur={componentProps.onBlur}
        onPaste={componentProps.onPaste}
        onFocus={componentProps.onFocus}
        onKeyDown={(event: React.KeyboardEvent): void => {
          const keysRegExp = /(1|2|3|4|5|6|7|8|9|0|Backspace|Delete|ArrowRight|ArrowLeft|Tab|Enter)/;
          if (!keysRegExp.test(event.key) && !event.ctrlKey) {
            event.preventDefault();
          }
        }}
        transform={(value: string): [string] => {
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
        }}
        debounceTimeout={debounceTimeout}
        autofocus={componentProps.autofocus as boolean}
        id={field.path.replace(/\./g, '__')}
        allowedKeys={componentProps.allowedKeys}
        onIconClick={componentProps.onIconClick}
        autocomplete={componentProps.autocomplete}
        iconPosition={componentProps.iconPosition}
        onIconKeyDown={componentProps.onIconKeyDown}
        readonly={componentProps.readonly || !field.isActive}
        value={field.value !== undefined && field.value !== null
          ? (field.value as Date).toISOString().split('T')[0].replace(/-/g, '/')
          : field.value}
        onChange={(value: string): void => {
          if (/^(\d{4})\/(\d{2})\/(\d{2})$/.test(value)) {
            const newDate = new Date(new Date(value).getTime() + 25 * 3600 * 1000);
            onUserAction('input', field.path, newDate.toISOString().split('T')[0].replace(/-/g, '/'));
          }
        }}
        modifiers={`${field.status} ${componentProps.modifiers || ''}`}
      />
    );
  },
  Textarea(field, onUserAction) {
    const { componentProps } = field;
    const debounceTimeout = (componentProps.debounceTimeout !== undefined)
      ? componentProps.debounceTimeout
      : 100;
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : null;
    const JSXTextarea = biuty.UITextarea as JSXElement;
    return (
      <JSXTextarea
        name={field.path}
        label={field.label}
        helper={field.message}
        placeholder={placeholder}
        cols={componentProps.cols}
        rows={componentProps.rows}
        onBlur={componentProps.onBlur}
        onPaste={componentProps.onPaste}
        onFocus={componentProps.onFocus}
        debounceTimeout={debounceTimeout}
        onKeyDown={componentProps.onKeyDown}
        autofocus={componentProps.autofocus}
        maxlength={componentProps.maxlength}
        id={field.path.replace(/\./g, '__')}
        autocomplete={componentProps.autocomplete}
        readonly={componentProps.readonly || !field.isActive}
        value={field.value !== null ? `${field.value}` : field.value}
        modifiers={`${field.status} ${componentProps.modifiers || ''}`}
        onChange={(value: string): void => onUserAction('input', field.path, value)}
      />
    );
  },
  FilePicker(field, onUserAction) {
    const { componentProps } = field;
    const placeholder = (componentProps.placeholder !== undefined)
      ? field.i18n(componentProps.placeholder, field.allValues)
      : null;
    const JSXUIFilePicker = biuty.UIFilePicker as JSXElement;
    return (
      <JSXUIFilePicker
        name={field.path}
        label={field.label}
        value={field.value}
        helper={field.message}
        icon={componentProps.icon}
        placeholder={placeholder}
        accept={componentProps.accept}
        onFocus={componentProps.onFocus}
        multiple={componentProps.multiple}
        id={field.path.replace(/\./g, '__')}
        iconPosition={componentProps.iconPosition}
        modifiers={`${field.status} ${componentProps.modifiers || ''}`}
        onChange={(value: File): void => onUserAction('input', field.path, value)}
      />
    );
  },
} as CustomComponents;
