/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';

/**
 * biuty/react mock.
 */
function Component(props: Any): JSX.Element {
  const { onChange, onFocus, onClick } = props;

  // Covers `onChange` handler.
  if (onChange !== undefined) {
    setTimeout(() => {
      onChange('test');
    }, 10);
  }
  // Covers `onFocus` handler.
  if (onFocus !== undefined) {
    onFocus();
  }
  // Covers `onClick` handler.
  if (onClick !== undefined && process.env.NOCLICK !== 'true') {
    setTimeout(() => {
      onClick();
    }, 10);
  }
  return (
    <div>{JSON.stringify(props)}</div>
  );
}

export const UILink = Component;
export const UIButton = Component;
export const UIOptions = Component;
export const UITextfield = Component;
export const UITextarea = Component;
export const UIFilePicker = Component;
export const buildClass = jest.fn((...values: string[]): string => values.join(' '));
export const markdown = jest.fn((label: string, lightMode: boolean) => `MARKDOWN FOR ${label}, ${lightMode}`);
