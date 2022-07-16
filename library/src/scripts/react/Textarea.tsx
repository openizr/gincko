/* istanbul ignore file */

/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import { UITextarea } from 'biuty/react';

interface TextareaProps {
  id?: string;
  name: string;
  cols?: number;
  rows?: number;
  value?: string;
  label?: string;
  helper?: string;
  readonly?: boolean;
  maxlength?: number;
  modifiers?: string;
  autofocus?: boolean;
  debounceTimeout: number;
  placeholder?: string | null;
  autocomplete?: 'on' | 'off';
  onPaste?: (event: React.ClipboardEvent<unknown>) => void;
  onKeyDown?: (event: React.KeyboardEvent<unknown>) => void;
  onBlur?: (value: string, event: React.FocusEvent<unknown>) => void;
  onFocus?: (value: string, event: React.FocusEvent<unknown>) => void;
  onChange?: (value: string, event: React.ChangeEvent<unknown>) => void;
}

/**
 * This HOC is used to delay value updates on textareas. As user actions hooks are asynchronous,
 * a few hundred of milliseconds can pass between the moment user puts something in the text field,
 * and the moment hooks are finished and mutation is actually propagated into the DOM. This can lead
 * to glitches (text field being updated with a previous value while user is typing something else).
 */
function Textarea(props: TextareaProps): JSX.Element {
  const { debounceTimeout, value, onChange } = props;
  const timeout = React.useRef<NodeJS.Timeout | null>(null);
  const [currentValue, setCurrentValue] = React.useState(value);
  const reverseTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleChange = (newValue: string, event: React.ChangeEvent<unknown>): void => {
    setCurrentValue(newValue);
    clearTimeout(reverseTimeout.current as NodeJS.Timeout);
    if (onChange !== undefined && onChange !== null) {
      window.clearTimeout(timeout.current as NodeJS.Timeout);
      // This debounce system prevents triggering `onChange` callback too many times when user is
      // still typing to save performance and make the UI more reactive on low-perfomance devices.
      timeout.current = setTimeout(() => {
        onChange(newValue, event);
      }, debounceTimeout as number);
    }
  };

  // Updates current value each time the `value` property is changed.
  React.useEffect(() => {
    clearTimeout(reverseTimeout.current as NodeJS.Timeout);
    // This reverse debounce system prevents inconsistent behaviours with textareas, having
    // characters that disappear / reappear during typing because mutations are asynchronous.
    // This is a hotfix waiting for a refactoring at gincko level.
    reverseTimeout.current = setTimeout(() => {
      setCurrentValue(value);
    }, debounceTimeout + 100);
  }, [value, debounceTimeout]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <UITextarea {...props} value={currentValue} debounceTimeout={0} onChange={handleChange} />
  );
}

export default React.memo(Textarea);
