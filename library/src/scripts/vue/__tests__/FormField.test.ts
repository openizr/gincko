/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import FormField from 'scripts/vue/FormField.vue';
import { render, waitFor } from '@testing-library/vue';

vi.mock('biuty/vue');
vi.mock('scripts/core/Engine');
vi.mock('scripts/vue/MessageField.vue');
vi.mock('scripts/vue/NestedFields.vue');

const flushPromise = vi.fn(() => new Promise<void>((resolve) => { setTimeout(resolve, 50); }));

describe('vue/FormField', () => {
  const isActive = true;
  const customComponents = {};
  const userInputs = { test: 'ok' };
  const variables = { var: 'value' };
  const i18n = vi.fn(() => 'TRANSLATED LABEL');
  const onUserAction = vi.fn() as unknown as OnUserAction;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.IS_DATE;
  });

  test('renders correctly - Unknown component', async () => {
    const { container } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          status: 'success',
          component: 'Unknown',
          componentProps: {},
        },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - Message with label and helper', async () => {
    const { container } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          label: 'Test',
          status: 'success',
          component: 'Message',
          componentProps: { helper: 'Helper' },
        },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - Message with label and message', async () => {
    const { container } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          label: 'Test',
          message: 'Success',
          status: 'success',
          component: 'Message',
          componentProps: { helper: 'Helper' },
        },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - Button', async () => {
    const { container } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          status: 'success',
          component: 'Button',
          componentProps: {},
        },
      },
    });
    await waitFor(flushPromise);
    expect(container.firstChild).toMatchSnapshot();
    expect(onUserAction).toHaveBeenCalledTimes(1);
    expect(onUserAction).toHaveBeenCalledWith('input', 'path.0.to.field', true);
  });

  test('renders correctly - Link', async () => {
    const { container } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          status: 'success',
          component: 'Link',
          componentProps: {},
        },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - Options', async () => {
    const { container } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          status: 'success',
          component: 'Options',
          componentProps: {
            onFocus: (): null => null,
            options: [{ label: 'test', value: 'option1' }, { value: 'option2' }],
          },
        },
      },
    });
    await waitFor(flushPromise);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - DatePicker', async () => {
    process.env.IS_DATE = 'true';
    const { container, rerender } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          status: 'success',
          component: 'DatePicker',
          componentProps: {},
          value: null,
        },
      },
    });
    await waitFor(flushPromise);
    expect(container.firstChild).toMatchSnapshot();
    await rerender({
      isActive,
      i18n,
      path: 'path.0.to.field',
      variables,
      userInputs,
      onUserAction,
      customComponents,
      field: {
        id: 'field',
        status: 'success',
        component: 'DatePicker',
        value: new Date(1657192371401),
        componentProps: { placeholder: 'placeholder', debounceTimeout: 10 },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - Textfield', async () => {
    const { container, rerender } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          value: null,
          status: 'success',
          component: 'Textfield',
          componentProps: {},
        },
      },
    });
    await waitFor(flushPromise);
    expect(container.firstChild).toMatchSnapshot();
    await rerender({
      isActive,
      i18n,
      path: 'path.0.to.field',
      variables,
      userInputs,
      onUserAction,
      customComponents,
      field: {
        id: 'field',
        value: 'test',
        status: 'success',
        component: 'Textfield',
        componentProps: { placeholder: 'placeholder', debounceTimeout: 10 },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - Textarea', async () => {
    const { container, rerender } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          value: null,
          status: 'success',
          component: 'Textarea',
          componentProps: {},
        },
      },
    });
    await waitFor(flushPromise);
    expect(container.firstChild).toMatchSnapshot();
    await rerender({
      isActive,
      i18n,
      path: 'path.0.to.field',
      variables,
      userInputs,
      onUserAction,
      customComponents,
      field: {
        id: 'field',
        value: 'test',
        status: 'success',
        component: 'Textarea',
        componentProps: { placeholder: 'placeholder', debounceTimeout: 10 },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - FilePicker', async () => {
    const { container, rerender } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          status: 'success',
          component: 'FilePicker',
          componentProps: {},
        },
      },
    });
    await waitFor(flushPromise);
    expect(container.firstChild).toMatchSnapshot();
    await rerender({
      isActive,
      i18n,
      path: 'path.0.to.field',
      variables,
      userInputs,
      onUserAction,
      customComponents,
      field: {
        id: 'field',
        status: 'success',
        component: 'FilePicker',
        componentProps: { placeholder: 'placeholder' },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - Array', async () => {
    const { container, rerender } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          status: 'success',
          component: 'Array',
          componentProps: {},
          fields: [],
        },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
    await rerender({
      isActive: false,
      i18n,
      path: 'path.0.to.field',
      variables,
      userInputs,
      onUserAction,
      customComponents,
      field: {
        id: 'field',
        status: 'success',
        component: 'Array',
        componentProps: {
          addButtonProps: { label: 'add' },
          removeButtonProps: { label: 'remove' },
        },
        fields: [],
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - DynamicObject', async () => {
    const { container, rerender } = render(FormField, {
      props: {
        isActive,
        i18n,
        path: 'path.0.to.field',
        variables,
        userInputs,
        onUserAction,
        customComponents,
        field: {
          id: 'field',
          status: 'success',
          component: 'DynamicObject',
          componentProps: {},
          fields: [],
        },
      },
    });
    expect(container.firstChild).toMatchSnapshot();
    await rerender({
      isActive,
      i18n,
      path: 'path.0.to.field',
      variables,
      userInputs,
      onUserAction,
      customComponents,
      field: {
        id: 'field',
        status: 'success',
        component: 'DynamicObject',
        componentProps: {
          addTextfieldProps: { label: 'pattern', placeholder: 'placeholder' },
        },
        fields: [],
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
