/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import Vue, { VNodeChildren } from 'vue';
import { mount } from '@vue/test-utils';
import Field from 'scripts/vue/components/Field.vue';

type ComponentApi = {
  id?: string;
  readonly?: boolean;
  on: Record<string, () => void>;
  $emit?: (eventName: string) => void;
  attrs: Record<string, string | boolean | undefined>;
};

jest.mock('sonar-ui/vue', () => {
  const Component = {
    render(createElement: (tag: string, api: ComponentApi) => VNodeChildren): VNodeChildren {
      const self = (this as unknown as ComponentApi & { $emit: (eventName: string) => void; });
      return createElement('div', {
        attrs: {
          id: self.id,
          'data-readonly': self.readonly,
        },
        on: {
          click(): void {
            self.$emit('click');
          },
          change(): void {
            self.$emit('change');
          },
          keyDown(): void {
            self.$emit('focus');
          },
        },
      });
    },
  };

  const markdown = (value: string): string => value;
  const buildClass = (...values: string[]): string => values.join(' ');
  const UIRadio = Vue.extend(Component as unknown as undefined);
  const UIButton = Vue.extend(Component as unknown as undefined);
  const UIDropdown = Vue.extend(Component as unknown as undefined);
  const UICheckbox = Vue.extend(Component as unknown as undefined);
  const UITextarea = Vue.extend(Component as unknown as undefined);
  const UITextfield = Vue.extend(Component as unknown as undefined);
  const UIFileUploader = Vue.extend(Component as unknown as undefined);

  return {
    markdown,
    buildClass,
    UIRadio,
    UIButton,
    UIDropdown,
    UICheckbox,
    UITextarea,
    UITextfield,
    UIFileUploader,
  };
});

describe('vue/components/Field', () => {
  const i18n = (): string => 'Test';
  const onUserAction = jest.fn();
  const customComponents = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('unknown field type', () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Message',
        type: 'Unknown',
        status: 'initial',
        options: {},
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Message with empty label', () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Message',
        type: 'Message',
        status: 'initial',
        options: {},
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Message with label', () => {
    const wrapper = mount(Field, {
      propsData: {
        id: 'Message',
        type: 'Message',
        status: 'initial',
        label: 'Test {{value}}',
        i18n: (): string => 'Test test',
        options: { formValues: { value: 'test' } },
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Button', async () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Button',
        active: true,
        type: 'Button',
        status: 'initial',
        label: 'Test',
        options: {},
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    await wrapper.trigger('click');
    expect(wrapper.html()).toMatchSnapshot();
    expect(onUserAction).toHaveBeenCalledTimes(1);
  });

  test('Textfield - active then inactive step', async () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Textfield',
        active: true,
        type: 'Textfield',
        status: 'initial',
        label: 'Test',
        options: {},
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
    wrapper.setProps({ active: false });
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Textfield - active step, readonly option is `true`', () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Textfield',
        active: true,
        type: 'Textfield',
        status: 'initial',
        label: 'Test',
        options: { readonly: true },
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Textfield - with onFocus method, inactive step', async () => {
    const onFocus = jest.fn();
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Textfield',
        active: false,
        type: 'Textfield',
        status: 'initial',
        label: 'Test',
        options: { onFocus },
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
    expect(onFocus).toHaveBeenCalledTimes(0);
    await wrapper.trigger('keyDown');
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  test('Textfield - with no onFocus method', async () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Textfield',
        active: false,
        type: 'Textfield',
        status: 'initial',
        label: 'Test',
        options: {},
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    await wrapper.trigger('change');
    await wrapper.trigger('keyDown');
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Textarea - active then inactive step', async () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Textarea',
        active: true,
        type: 'Textarea',
        status: 'initial',
        label: 'Test',
        options: {},
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
    wrapper.setProps({ active: false });
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Textarea - active step, readonly option is `true`', () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Textarea',
        active: true,
        type: 'Textarea',
        status: 'initial',
        label: 'Test',
        options: { readonly: true },
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Textarea - with onFocus method, inactive step', async () => {
    const onFocus = jest.fn();
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Textarea',
        active: false,
        type: 'Textarea',
        status: 'initial',
        label: 'Test',
        options: { onFocus },
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
    expect(onFocus).toHaveBeenCalledTimes(0);
    await wrapper.trigger('change');
    await wrapper.trigger('keyDown');
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  test('Textarea - with no onFocus method', async () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Textarea',
        active: false,
        type: 'Textarea',
        status: 'initial',
        label: 'Test',
        options: {},
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    await wrapper.trigger('keyDown');
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('FileUploader', async () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'FileUploader',
        active: true,
        type: 'FileUploader',
        status: 'initial',
        label: 'Test',
        options: {},
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    await wrapper.trigger('change');
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Dropdown', async () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Dropdown',
        active: true,
        type: 'Dropdown',
        status: 'initial',
        label: 'Test',
        options: {
          options: [
            { type: 'option', label: 'Test' },
            { type: 'divider' },
          ],
        },
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    await wrapper.trigger('change');
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Checkbox', async () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Checkbox',
        active: true,
        type: 'Checkbox',
        status: 'initial',
        label: 'Test',
        options: {
          options: [
            { type: 'option', label: 'Test' },
            { type: 'divider' },
          ],
        },
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    await wrapper.trigger('change');
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Radio', async () => {
    const wrapper = mount(Field, {
      propsData: {
        i18n,
        id: 'Radio',
        active: true,
        type: 'Radio',
        status: 'initial',
        label: 'Test',
        options: {
          options: [
            { type: 'option', label: 'Test' },
            { type: 'divider' },
          ],
        },
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    await wrapper.trigger('change');
    expect(wrapper.html()).toMatchSnapshot();
  });
});
