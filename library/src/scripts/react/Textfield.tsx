/* istanbul ignore file */

/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import { UITextfield } from 'biuty/react';

interface TextfieldProps {
  id?: string;
  name: string;
  min?: number;
  max?: number;
  step?: number;
  icon?: string;
  size?: number;
  value?: string | null;
  label?: string;
  helper?: string;
  readonly?: boolean;
  maxlength?: number;
  modifiers?: string;
  autofocus?: boolean;
  debounceTimeout: number;
  placeholder?: string | null;
  autocomplete?: 'on' | 'off';
  iconPosition?: 'left' | 'right';
  allowedKeys?: {
    altKey?: RegExp;
    metaKey?: RegExp;
    ctrlKey?: RegExp;
    default?: RegExp;
    shiftKey?: RegExp;
  };
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url';
  transform?: (value: string, selectionStart: number) => [string, number?];
  onIconClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onIconKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  onPaste?: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (value: string, event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (value: string, event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * This HOC is used to delay value updates on textfields. As user actions hooks are asynchronous,
 * a few hundred of milliseconds can pass between the moment user puts something in the text field,
 * and the moment hooks are finished and mutation is actually propagated into the DOM. This can lead
 * to glitches (text field being updated with a previous value while user is typing something else).
 */
function Textfield(props: TextfieldProps): JSX.Element {
  const { debounceTimeout, transform, value } = props;
  const reverseTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const actualTransform = React.useCallback((filteredValue: string, selectionStart: number) => {
    clearTimeout(reverseTimeout.current as NodeJS.Timeout);
    return (transform || ((newValue): [string] => [newValue]))(filteredValue, selectionStart);
  }, [transform]);
  const [currentValue, setCurrentValue] = React.useState(value || '');

  // Updates current value each time the `value` property is changed.
  React.useEffect(() => {
    clearTimeout(reverseTimeout.current as NodeJS.Timeout);
    // This reverse debounce system prevents inconsistent behaviours with textfields, having
    // characters that disappear / reappear during typing because mutations are asynchronous.
    // This is a hotfix waiting for a refactoring at gincko level.
    reverseTimeout.current = setTimeout(() => {
      setCurrentValue(value || '');
    }, debounceTimeout + 100);
  }, [value, debounceTimeout]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <UITextfield {...props} transform={actualTransform} value={currentValue} />
  );
}

export default React.memo(Textfield);
