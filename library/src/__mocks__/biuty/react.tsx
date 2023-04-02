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
function Component(props: JSXElement): JSX.Element {
  const { onChange, onFocus, onClick } = props;
  const { transform, onKeyDown, onBlur } = props;

  // Covers `onChange` handler.
  setTimeout(() => {
    onChange?.('test');
    if (process.env.IS_DATE === 'true') {
      onChange?.('2020/02/20');
    }
  }, 10);

  // Covers `onFocus` handler.
  onFocus?.();

  // Covers `onBlur` handler.
  onBlur?.();

  // Covers `transform` function.
  transform?.('ok');
  transform?.('1002');
  transform?.('100220');
  transform?.('10022020');

  // Covers `onKeyDown` handler.
  onKeyDown?.('', { key: '1' });
  onKeyDown?.('', { key: 'A', ctrlKey: false, preventDefault: vi.fn() });
  // Covers `onClick` handler.
  if (process.env.NOCLICK !== 'true') {
    setTimeout(() => {
      onClick?.();
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
export const buildClass = vi.fn((...values: string[]): string => values.join(' '));
export const markdown = vi.fn((label: string, lightMode: boolean) => `MARKDOWN FOR ${label}, ${lightMode}`);
