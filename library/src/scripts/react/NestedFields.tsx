/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import Field from 'scripts/react/Field';
import { buildClass, UIButton, UITextfield } from 'biuty/react';

interface NestedFieldsProps {
  t: I18n;
  id?: string;
  path: string;
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
    onFocus?: (event: FocusEvent) => void;
  };
  removeButtonProps?: {
    icon?: string;
    label?: string;
    modifiers?: string;
    iconPosition?: 'left' | 'right';
    onFocus?: (event: FocusEvent) => void;
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
    onIconClick?: (event: MouseEvent) => void;
    onIconKeyDown?: (event: KeyboardEvent) => void;
    onPaste?: (value: string, event: ClipboardEvent) => void;
    onKeyDown?: (value: string, event: KeyboardEvent) => void;
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
  };
  minItems?: number;
  maxItems?: number;
  variables: Variables;
  userInputs: UserInputs;
  allowedPatterns?: RegExp[];
  onUserAction: OnUserAction;
  customComponents?: CustomComponents;
  value?: UserInput[] | UserInputs | null;
  type: 'array' | 'object' | 'dynamicObject';
}

const defaultArrayValue: UserInput[] = [];
const defaultObjectValue: UserInputs = {};

/**
 * Nested fields (array / object / dynamicObject) form component.
 */
function NestedFields({
  id,
  t,
  type,
  path,
  label,
  fields,
  helper,
  variables,
  userInputs,
  minItems = 0,
  value = null,
  onUserAction,
  modifiers = '',
  isActive = false,
  addButtonProps = {},
  maxItems = Infinity,
  allowedPatterns = [],
  addTextfieldProps = {},
  customComponents = {},
  removeButtonProps = {},
}: NestedFieldsProps): JSX.Element {
  const [newKey, setNewKey] = React.useState('');
  let currentValue = value as UserInputs | UserInput[];
  if (currentValue === null) {
    currentValue = (type === 'array') ? defaultArrayValue : defaultObjectValue;
  }
  const [isInvalidPattern, setIsInvalidPattern] = React.useState(false);
  const className = buildClass('ui-nested-fields', [modifiers, type].join(' '));
  const keyExistsOrIsEmpty = newKey === '' || (currentValue as UserInputs)[newKey] !== undefined;
  const addButtonDisabledModifier = (isInvalidPattern || (type === 'dynamicObject' && keyExistsOrIsEmpty)) ? 'disabled' : '';
  const isAddButtonDisabled = React.useMemo(() => (
    fields.length >= maxItems
  ), [fields.length, maxItems]);

  const removeItem = React.useCallback((index: number) => () => {
    const valueKeys = Object.keys(currentValue);
    const newValue: UserInputs = Array.isArray(currentValue)
      ? currentValue.slice(0, index).concat(currentValue.slice(index + 1))
      : valueKeys.slice(0, index).concat(valueKeys.slice(index + 1)).reduce((finalValue, key) => ({
        ...finalValue,
        [key]: (currentValue as UserInputs)[key],
      }), {});
    onUserAction('input', path, newValue);
  }, [onUserAction, path, currentValue]);

  const addItem = React.useCallback(() => {
    onUserAction('input', path, Array.isArray(currentValue)
      ? currentValue.concat([null])
      : { ...currentValue, [newKey]: null });
    setNewKey('');
  }, [onUserAction, path, currentValue, newKey]);

  const handleChange = React.useCallback((newValue: string) => {
    let noPatternMatch = true;
    setNewKey(newValue);
    for (let index = 0, { length } = allowedPatterns; index < length; index += 1) {
      if (allowedPatterns[index].test(newValue)) {
        noPatternMatch = false;
      }
    }
    setIsInvalidPattern(noPatternMatch);
  }, [allowedPatterns]);

  // Adds new fields if length does not fit minimum length.
  React.useEffect(() => {
    const currentLength = (currentValue as UserInput[]).length;
    if (type === 'array' && currentLength < minItems) {
      const newLength = minItems - currentLength;
      onUserAction('input', path, (currentValue as UserInput[]).concat(new Array(newLength).fill(null)));
    }
  }, [minItems, onUserAction, currentValue, path, type]);

  // Removes extra fields if length does not fit maximum length.
  React.useEffect(() => {
    const currentLength = (currentValue as UserInput[]).length;
    if (type === 'array' && currentLength > maxItems) {
      onUserAction('input', path, (currentValue as UserInput[]).slice(0, maxItems));
    }
  }, [onUserAction, currentValue, maxItems, path, type]);

  return (
    <div id={id} className={className}>
      {(label !== undefined) && <span className="ui-nested-fields__label">{label}</span>}

      {fields.map((field, index) => {
        if (field === null) {
          return null;
        }

        return (
          <div className="ui-nested-fields__field" key={`${path}.${field.id}`}>
            {(type === 'dynamicObject') && <span className="ui-nested-fields__field__label">{field.id}</span>}

            {(type !== 'object' && fields.length > minItems) && (
              <UIButton
                type="button"
                onClick={removeItem(index)}
                icon={removeButtonProps.icon}
                label={removeButtonProps.label}
                onFocus={removeButtonProps.onFocus}
                modifiers={removeButtonProps.modifiers}
                iconPosition={removeButtonProps.iconPosition}
              />
            )}
            <Field
              i18n={t}
              field={field}
              isActive={isActive}
              variables={variables}
              userInputs={userInputs}
              onUserAction={onUserAction}
              path={`${path}.${field.id}`}
              customComponents={customComponents}
            />
          </div>
        );
      })}

      {(type !== 'object') && (
        <div className="ui-nested-fields__add">
          {(type === 'dynamicObject' && !isAddButtonDisabled) && (
            <UITextfield
              value={newKey}
              name={`${id}-add`}
              readonly={!isActive}
              onChange={handleChange}
              icon={addTextfieldProps.icon}
              label={addTextfieldProps.label}
              onBlur={addTextfieldProps.onBlur}
              onPaste={addTextfieldProps.onPaste}
              onFocus={addTextfieldProps.onFocus}
              modifiers={addTextfieldProps.modifiers}
              autofocus={addTextfieldProps.autofocus}
              transform={addTextfieldProps.transform}
              onKeyDown={addTextfieldProps.onKeyDown}
              maxlength={addTextfieldProps.maxlength}
              allowedKeys={addTextfieldProps.allowedKeys}
              placeholder={addTextfieldProps.placeholder}
              onIconClick={addTextfieldProps.onIconClick}
              autocomplete={addTextfieldProps.autocomplete}
              iconPosition={addTextfieldProps.iconPosition}
              onIconKeyDown={addTextfieldProps.onIconKeyDown}
              helper={isInvalidPattern ? addTextfieldProps.helper : undefined}
              debounceTimeout={(addTextfieldProps.debounceTimeout !== undefined)
                ? addTextfieldProps.debounceTimeout
                : 100}
            />
          )}
          {!isAddButtonDisabled && (
            <UIButton
              type="button"
              onClick={addItem}
              icon={addButtonProps.icon}
              label={addButtonProps.label}
              onFocus={addButtonProps.onFocus}
              iconPosition={addButtonProps.iconPosition}
              modifiers={`${addButtonDisabledModifier} ${addButtonProps.modifiers || ''}`}
            />
          )}
        </div>
      )}
      {(helper !== undefined) && <span className="ui-nested-fields__helper">{helper}</span>}
    </div>
  ) as Any;
}

export default React.memo(NestedFields) as Any;
