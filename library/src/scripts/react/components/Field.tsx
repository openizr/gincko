/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable react/destructuring-assignment */

import {
  UIRadio,
  UIButton,
  UIDropdown,
  UICheckbox,
  UITextarea,
  UITextfield,
  UIFileUploader,
} from 'sonar-ui/react';
import * as React from 'react';
import { AnyValue } from 'scripts/core/Engine';
import PropTypes, { InferProps } from 'prop-types';
import Message from 'scripts/react/components/Message';
import fieldPropType, { Field as FormField } from 'scripts/propTypes/field';

type OUA = (type: 'click' | 'input', newValue: AnyValue) => void;
type I18n = (label: string, values?: Record<string, string>) => string;
type Option = { value?: string; label?: string; type?: string; disabled?: boolean; };

export type Component = (field: FormField & { i18n: I18n; }, onUserAction: OUA) => JSX.Element;

export type Components = {
  [type: string]: Component;
};

const propTypes = {
  ...fieldPropType,
  onUserAction: PropTypes.func.isRequired,
  customComponents: PropTypes.objectOf(PropTypes.func.isRequired).isRequired,
};

const defaultProps = {};

/**
 * Built-in form components.
 */
const builtInComponents: Components = {
  Message: (field) => (
    <Message
      id={field.id}
      label={field.label}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
  Button: (field, onUserAction) => (
    <UIButton
      id={field.id}
      label={field.label}
      icon={field.options.icon}
      type={field.options.type}
      iconPosition={field.options.iconPosition}
      onClick={(): void => onUserAction('input', true)}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
  Textfield: (field, onUserAction) => (
    <UITextfield
      id={field.id}
      name={field.id}
      value={field.value}
      label={field.label}
      helper={field.message}
      min={field.options.min}
      max={field.options.max}
      step={field.options.step}
      icon={field.options.icon}
      size={field.options.size}
      type={field.options.type}
      onBlur={field.options.onBlur}
      onPaste={field.options.onPaste}
      onFocus={field.options.onFocus}
      onKeyDown={field.options.onKeyDown}
      maxlength={field.options.maxlength}
      transform={field.options.transform}
      onIconClick={field.options.onIconClick}
      autocomplete={field.options.autocomplete}
      iconPosition={field.options.iconPosition}
      debounceTimeout={field.options.debounceTimeout || 100}
      onChange={(value): void => onUserAction('input', value)}
      readonly={field.options.readonly || field.active === false}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
      placeholder={(field.options.placeholder !== undefined && field.options.placeholder !== null)
        ? field.i18n(field.options.placeholder, field.allValues)
        : null}
    />
  ),
  Textarea: (field, onUserAction) => (
    <UITextarea
      id={field.id}
      name={field.id}
      value={field.value}
      label={field.label}
      helper={field.message}
      cols={field.options.cols}
      rows={field.options.rows}
      onBlur={field.options.onBlur}
      onPaste={field.options.onPaste}
      onFocus={field.options.onFocus}
      onKeyDown={field.options.onKeyDown}
      maxlength={field.options.maxlength}
      transform={field.options.transform}
      autocomplete={field.options.autocomplete}
      debounceTimeout={field.options.debounceTimeout || 100}
      onChange={(value): void => onUserAction('input', value)}
      readonly={field.options.readonly || field.active === false}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
      placeholder={(field.options.placeholder !== undefined && field.options.placeholder !== null)
        ? field.i18n(field.options.placeholder, field.allValues)
        : null}
    />
  ),
  FileUploader: (field, onUserAction) => (
    <UIFileUploader
      id={field.id}
      name={field.id}
      label={field.label}
      value={field.value}
      helper={field.message}
      icon={field.options.icon}
      accept={field.options.accept}
      onFocus={field.options.onFocus}
      multiple={field.options.multiple}
      iconPosition={field.options.iconPosition}
      onChange={(value): void => onUserAction('input', value)}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
      placeholder={(field.options.placeholder !== undefined && field.options.placeholder !== null)
        ? field.i18n(field.options.placeholder, field.allValues)
        : null}
    />
  ),
  Dropdown: (field, onUserAction) => (
    <UIDropdown
      id={field.id}
      name={field.id}
      label={field.label}
      value={field.value}
      helper={field.message}
      icon={field.options.icon}
      onFocus={field.options.onFocus}
      onChange={(value): void => onUserAction('input', value)}
      options={field.options.options.map((option: Option) => ((option.label !== undefined)
        ? ({ ...option, label: field.i18n(option.label, field.allValues) })
        : option))}
      multiple={field.options.multiple}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
  Checkbox: (field, onUserAction) => (
    <UICheckbox
      id={field.id}
      name={field.id}
      label={field.label}
      value={field.value}
      helper={field.message}
      onFocus={field.options.onFocus}
      onChange={(value): void => onUserAction('input', value)}
      options={field.options.options.map((option: Option) => ((option.label !== undefined)
        ? ({ ...option, label: field.i18n(option.label, field.allValues) })
        : option))}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
  Radio: (field, onUserAction) => (
    <UIRadio
      id={field.id}
      name={field.id}
      label={field.label}
      value={field.value}
      helper={field.message}
      onFocus={field.options.onFocus}
      onChange={(value): void => onUserAction('input', value)}
      options={field.options.options.map((option: Option) => ((option.label !== undefined)
        ? ({ ...option, label: field.i18n(option.label, field.allValues) })
        : option))}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
};

/**
 * Form field.
 */
export default function Field(props: InferProps<typeof propTypes>): JSX.Element | null {
  const i18n = props.i18n as I18n;
  const { active } = props;
  const { value, status, options } = props;
  const { id, type, customComponents } = props;
  const allComponents: Components = { ...builtInComponents, ...customComponents };
  const label = React.useMemo(() => ((props.label !== undefined && props.label !== null)
    ? i18n(props.label, props.allValues)
    : null), [props.label, props.allValues]);
  const message = React.useMemo(() => {
    const helper = props.message || options.helper;
    return (helper !== undefined && helper !== null)
      ? i18n(helper, props.allValues)
      : null;
  }, [props.message, options.helper, props.allValues]);

  // The following lines prevent browsers auto-fill system from changing fields
  // located in other steps, resetting previous steps and breaking overall UX.
  const [isActive, setIsActive] = React.useState(active);

  React.useEffect(() => {
    setIsActive(active);
  }, [active]);

  const focusField = (focusedValue: AnyValue): void => {
    setIsActive(true);
    if (options.onFocus !== undefined) {
      options.onFocus(focusedValue);
    }
  };

  const onUserAction: OUA = (actionType, newValue) => {
    props.onUserAction({ type: actionType, value: newValue, fieldId: id });
  };

  // Unknown field type...
  if (allComponents[type] === undefined) {
    return null;
  }
  // Registered field type...
  return allComponents[type]({
    id,
    type,
    label,
    message,
    active: isActive,
    i18n: i18n as I18n,
    value: value as AnyValue,
    allValues: props.allValues,
    options: { ...options, onFocus: focusField },
    status: status as 'success' | 'error' | 'initial',
  }, onUserAction);
}

Field.propTypes = propTypes;
Field.defaultProps = defaultProps;
Field.displayName = 'Field';
