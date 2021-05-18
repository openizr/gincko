/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import Field from 'scripts/vue/components/Field.vue';

jest.mock('sonar-ui/vue', () => {
  const Component = {
    render(createElement: Json): Json {
      const self = this as Json;
      return createElement('div', {
        attrs: {
          id: self.id,
          'data-readonly': self.readonly,
        },
        on: {
          click(): void {
            self.$emit('click');
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
  const UIRadio = Vue.extend(Component);
  const UIButton = Vue.extend(Component);
  const UIDropdown = Vue.extend(Component);
  const UICheckbox = Vue.extend(Component);
  const UITextfield = Vue.extend(Component);
  const UIFileUploader = Vue.extend(Component);

  return {
    markdown,
    buildClass,
    UIRadio,
    UIButton,
    UIDropdown,
    UICheckbox,
    UITextfield,
    UIFileUploader,
  };
});

describe('vue/components/Field', () => {
  const onUserAction = jest.fn();
  const customComponents = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('unknown field type', () => {
    const wrapper = mount(Field, {
      propsData: {
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
    await wrapper.trigger('keyDown');
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('FileUploader', () => {
    const wrapper = mount(Field, {
      propsData: {
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
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('Dropdown', () => {
    const wrapper = mount(Field, {
      propsData: {
        id: 'Dropdown',
        active: true,
        type: 'Dropdown',
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
  });

  test('Checkbox', () => {
    const wrapper = mount(Field, {
      propsData: {
        id: 'Checkbox',
        active: true,
        type: 'Checkbox',
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
  });

  test('Radio', () => {
    const wrapper = mount(Field, {
      propsData: {
        id: 'Radio',
        active: true,
        type: 'Radio',
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
  });
});
