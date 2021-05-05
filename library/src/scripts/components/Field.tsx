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
  markdown,
  buildClass,
  UIDropdown,
  UICheckbox,
  UITextfield,
  UIFileUploader,
} from 'sonar-ui/react';
import * as React from 'react';
import { Components } from 'scripts/types';
import PropTypes, { InferProps } from 'prop-types';
import fieldPropType from 'scripts/propTypes/field';

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
  Message: (field) => {
    // We perform dynamic form values injection into message if necessary.
    let content = field.label || '';
    Object.keys(field.options.formValues || {}).forEach((key) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), field.options.formValues[key]);
    });
    return (
      <section
        id={field.id}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: markdown(content, false) }}
        className={buildClass('ui-message', `${field.status} ${field.options.modifiers || ''}`.split(' '))}
      />
    );
  },
  Button: (field, onUserAction) => (
    <UIButton
      id={field.id}
      label={field.label}
      icon={field.options.icon}
      type={field.options.type}
      iconPosition={field.options.iconPosition}
      onClick={(): void => onUserAction(field.id)}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
  Textfield: (field, onUserAction) => (
    <UITextfield
      id={field.id}
      name={field.id}
      label={field.label}
      value={field.value}
      onChange={onUserAction}
      min={field.options.min}
      max={field.options.max}
      step={field.options.step}
      icon={field.options.icon}
      size={field.options.size}
      type={field.options.type}
      onBlur={field.options.onBlur}
      onFocus={field.options.onFocus}
      readonly={field.options.readonly || field.active === false}
      maxlength={field.options.maxlength}
      placeholder={field.options.placeholder}
      onIconClick={field.options.onIconClick}
      iconPosition={field.options.iconPosition}
      helper={field.message || field.options.helper}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
  FileUploader: (field, onUserAction) => (
    <UIFileUploader
      id={field.id}
      name={field.id}
      label={field.label}
      onChange={onUserAction}
      icon={field.options.icon}
      onFocus={field.options.onFocus}
      multiple={field.options.multiple}
      placeholder={field.options.placeholder}
      iconPosition={field.options.iconPosition}
      helper={field.message || field.options.helper}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
  Dropdown: (field, onUserAction) => (
    <UIDropdown
      id={field.id}
      name={field.id}
      label={field.label}
      value={field.value}
      onChange={onUserAction}
      icon={field.options.icon}
      onFocus={field.options.onFocus}
      options={field.options.options}
      multiple={field.options.multiple}
      helper={field.message || field.options.helper}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
  Checkbox: (field, onUserAction) => (
    <UICheckbox
      id={field.id}
      name={field.id}
      label={field.label}
      value={field.value}
      onChange={onUserAction}
      onFocus={field.options.onFocus}
      options={field.options.options}
      helper={field.message || field.options.helper}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
  Radio: (field, onUserAction) => (
    <UIRadio
      id={field.id}
      name={field.id}
      label={field.label}
      value={field.value}
      onChange={onUserAction}
      onFocus={field.options.onFocus}
      options={field.options.options}
      helper={field.message || field.options.helper}
      modifiers={`${field.status} ${field.options.modifiers || ''}`}
    />
  ),
};

/**
 * Form field.
 */
export default function Field(props: InferProps<typeof propTypes>): JSX.Element | null {
  // eslint-disable-next-line object-curly-newline
  const { label, active, value, status, options, message, id, type, customComponents } = props;
  const allComponents: Components = { ...builtInComponents, ...customComponents };

  // The following lines prevent browsers auto-fill system from changing fields
  // located in other steps, resetting previous steps and breaking overall UX.
  const [isActive, setIsActive] = React.useState(active);

  React.useEffect(() => {
    setIsActive(active);
  }, [active]);

  const focusField = (focusedValue: string | string[]): void => {
    setIsActive(true);
    if (options.onFocus !== undefined) {
      options.onFocus(focusedValue);
    }
  };

  const onUserAction = (newValue: string): void => {
    props.onUserAction(id, { type: 'input', value: newValue });
  };

  // Unknown field type...
  if (allComponents[type] === undefined) {
    return null;
  }
  // Registered field type...
  return allComponents[type]({
    id,
    label,
    type,
    options: { ...options, onFocus: focusField },
    message,
    active: isActive,
    value: value as string | string[],
    status: status as 'success' | 'error' | 'initial',
  }, onUserAction);
}

Field.propTypes = propTypes;
Field.defaultProps = defaultProps;
Field.displayName = 'Field';
