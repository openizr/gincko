/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import GenericComponent from 'scripts/__mocks__/biuty/GenericComponent.svelte';

/**
 * biuty/svelte mock.
 */
export const UILink = GenericComponent;
export const UIButton = GenericComponent;
export const UIOptions = GenericComponent;
export const UITextfield = GenericComponent;
export const UITextarea = GenericComponent;
export const UIFilePicker = GenericComponent;
export const buildClass = jest.fn((...values: string[]): string => values.join(' '));
export const markdown = jest.fn((label: string, lightMode: boolean) => `MARKDOWN FOR ${label}, ${lightMode}`);
