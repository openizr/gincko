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
import PropTypes, { InferProps } from 'prop-types';
import fieldPropType from 'scripts/propTypes/field';
import Message from 'scripts/react/components/Message';
import { Field as FormField, FormValue } from 'scripts/core/Engine';

type OUA = (newValue: Json) => void;
type I18n = (label: string, values?: Record<string, string>) => string;

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
      onClick={(): void => onUserAction(true)}
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
      onChange={onUserAction}
      step={field.options.step}
      icon={field.options.icon}
      size={field.options.size}
      type={field.options.type}
      onBlur={field.options.onBlur}
      onFocus={field.options.onFocus}
      maxlength={field.options.maxlength}
      transform={field.options.transform}
      onIconClick={field.options.onIconClick}
      autocomplete={field.options.autocomplete}
      iconPosition={field.options.iconPosition}
      debounceTimeout={field.options.debounceTimeout || 100}
      readonly={field.options.readonly || field.active === false}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
      placeholder={(field.options.placeholder !== undefined && field.options.placeholder !== null)
        ? field.i18n(field.options.placeholder, field.options.formValues)
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
      onChange={onUserAction}
      cols={field.options.cols}
      rows={field.options.rows}
      onBlur={field.options.onBlur}
      onFocus={field.options.onFocus}
      maxlength={field.options.maxlength}
      transform={field.options.transform}
      autocomplete={field.options.autocomplete}
      debounceTimeout={field.options.debounceTimeout || 100}
      readonly={field.options.readonly || field.active === false}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
      placeholder={(field.options.placeholder !== undefined && field.options.placeholder !== null)
        ? field.i18n(field.options.placeholder, field.options.formValues)
        : null}
    />
  ),
  FileUploader: (field, onUserAction) => (
    <UIFileUploader
      id={field.id}
      name={field.id}
      label={field.label}
      helper={field.message}
      onChange={onUserAction}
      icon={field.options.icon}
      onFocus={field.options.onFocus}
      multiple={field.options.multiple}
      iconPosition={field.options.iconPosition}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
      placeholder={(field.options.placeholder !== undefined && field.options.placeholder !== null)
        ? field.i18n(field.options.placeholder, field.options.formValues)
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
      onChange={onUserAction}
      icon={field.options.icon}
      onFocus={field.options.onFocus}
      options={field.options.options.map((option: Json) => ((option.type === 'option')
        ? ({ ...option, label: field.i18n(option.label, field.options.formValues) })
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
      onChange={onUserAction}
      onFocus={field.options.onFocus}
      options={field.options.options.map((option: Json) => ((option.type === 'option')
        ? ({ ...option, label: field.i18n(option.label, field.options.formValues) })
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
      onChange={onUserAction}
      onFocus={field.options.onFocus}
      options={field.options.options.map((option: Json) => ((option.type === 'option')
        ? ({ ...option, label: field.i18n(option.label, field.options.formValues) })
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
    ? i18n(props.label, options.formValues)
    : null), [props.label]);
  const message = React.useMemo(() => {
    const helper = props.message || options.helper;
    return (helper !== undefined && helper !== null)
      ? i18n(helper, options.formValues)
      : null;
  }, [props.message, options.helper]);

  // The following lines prevent browsers auto-fill system from changing fields
  // located in other steps, resetting previous steps and breaking overall UX.
  const [isActive, setIsActive] = React.useState(active);

  React.useEffect(() => {
    setIsActive(active);
  }, [active]);

  const focusField = (focusedValue: FormValue): void => {
    setIsActive(true);
    if (options.onFocus !== undefined) {
      options.onFocus(focusedValue);
    }
  };

  const onUserAction = (newValue: FormValue): void => {
    props.onUserAction({ type: 'input', value: newValue, fieldId: id });
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
    value: value as FormValue,
    options: { ...options, onFocus: focusField },
    status: status as 'success' | 'error' | 'initial',
  }, onUserAction);
}

Field.propTypes = propTypes;
Field.defaultProps = defaultProps;
Field.displayName = 'Field';
