/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import { render, waitFor } from '@testing-library/svelte';
import NestedFields from 'scripts/svelte/NestedFields.svelte';

vi.mock('biuty/svelte');
vi.mock('scripts/svelte/Field.svelte');

describe('svelte/NestedFields', () => {
  const onUserAction = vi.fn();
  const userInputs = { test: 'ok' };
  const variables = { var: 'value' };
  const i18n = vi.fn(() => 'TRANSLATED LABEL');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly - array', async () => {
    const { container } = render(NestedFields, {
      props: {
        t: i18n,
        type: 'array',
        label: 'Test',
        helper: 'Helper',
        path: 'path.0.to.field',
        variables,
        userInputs,
        fields: [{
          id: 'Message',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, null],
        onUserAction,
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - array with minItems', async () => {
    const { container, rerender } = render(NestedFields, {
      props: {
        t: i18n,
        type: 'array',
        minItems: 2,
        path: 'path.0.to.field',
        variables,
        userInputs,
        fields: [{
          id: 'Message1',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, {
          id: 'Message2',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, {
          id: 'Message3',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }],
        onUserAction,
      },
    });
    await waitFor(() => new Promise<void>((resolve) => { setTimeout(resolve, 50); }));
    expect(container.firstChild).toMatchSnapshot();
    rerender({
      t: i18n,
      variables,
      userInputs,
      type: 'array',
      onUserAction,
      path: 'path.0.to.field',
      minItems: 4,
      fields: [{
        id: 'Message1',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, {
        id: 'Message2',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null],
    });
    expect(container.firstChild).toMatchSnapshot();
    rerender({
      t: i18n,
      variables,
      userInputs,
      type: 'array',
      onUserAction,
      path: 'path.0.to.field',
      minItems: undefined,
      fields: [{
        id: 'Message1',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, {
        id: 'Message2',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null],
    });
  });

  test('renders correctly - array with maxItems', async () => {
    const { container, rerender } = render(NestedFields, {
      props: {
        t: i18n,
        type: 'array',
        path: 'path.0.to.field',
        variables,
        userInputs,
        maxItems: 1,
        value: ['test', 'test'],
        fields: [{
          id: 'Message',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, null],
        onUserAction,
      },
    });
    await waitFor(() => new Promise<void>((resolve) => { setTimeout(resolve, 50); }));
    expect(container.firstChild).toMatchSnapshot();
    rerender({
      t: i18n,
      variables,
      userInputs,
      type: 'array',
      onUserAction,
      path: 'path.0.to.field',
      maxItems: 0,
      fields: [{
        id: 'Message',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null],
    });
    expect(container.firstChild).toMatchSnapshot();
    rerender({
      t: i18n,
      variables,
      userInputs,
      type: 'array',
      onUserAction,
      path: 'path.0.to.field',
      maxItems: undefined,
      fields: [{
        id: 'Message',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null],
    });
  });

  test('renders correctly - object', async () => {
    const { container } = render(NestedFields, {
      props: {
        t: i18n,
        type: 'object',
        path: 'path.0.to.field',
        variables,
        userInputs,
        fields: [{
          id: 'Message',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, null],
        onUserAction,
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - dynamicObject with valid pattern', async () => {
    const { container } = render(NestedFields, {
      props: {
        t: i18n,
        type: 'dynamicObject',
        path: 'path.0.to.field',
        variables,
        userInputs,
        fields: [{
          id: 'Message',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, null],
        onUserAction,
        allowedPatterns: [/test/],
        addTextfieldProps: { debounceTimeout: 10 },
      },
    });
    await waitFor(() => new Promise<void>((resolve) => { setTimeout(resolve, 50); }));
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - dynamicObject with invalid pattern', async () => {
    const { container } = render(NestedFields, {
      props: {
        t: i18n,
        type: 'dynamicObject',
        path: 'path.0.to.field',
        variables,
        userInputs,
        fields: [{
          id: 'Message',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, null],
        onUserAction,
        addTextfieldProps: { debounceTimeout: 10, helper: 'INVALID' },
      },
    });
    await waitFor(() => new Promise<void>((resolve) => { setTimeout(resolve, 50); }));
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - dynamicObject with error', async () => {
    const { container, rerender } = render(NestedFields, {
      props: {
        t: i18n,
        helper: 'Error',
        modifiers: 'error',
        type: 'dynamicObject',
        variables,
        path: 'path.0.to.field',
        userInputs,
        fields: [{
          id: 'Message1',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, {
          id: 'Message2',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, null],
        onUserAction,
      },
    });
    rerender({
      t: i18n,
      variables,
      userInputs,
      onUserAction,
      type: 'dynamicObject',
      path: 'path.0.to.field',
      value: {
        test: 'Test',
        test2: 'Test',
      },
      fields: [{
        id: 'Message1',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, {
        id: 'Message2',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null],
    });
    await waitFor(() => new Promise<void>((resolve) => { setTimeout(resolve, 50); }));
    expect(container.firstChild).toMatchSnapshot();
  });
});
