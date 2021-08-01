/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { generateRandomId } from 'sonar-ui/vue';
import Form from 'scripts/vue/containers/Form.vue';

type I18n = (label: string, values?: Record<string, string>) => string;
type ComponentApi = {
  attrs: {
    id?: string;
  };
};

jest.mock('scripts/core/Engine');
jest.mock('scripts/vue/components/Step.vue', () => ({
  render(createElement: (tag: string, api: ComponentApi) => Component): Component {
    return createElement('div', {
      attrs: {
        id: 'Step',
      },
    });
  },
  mounted(): void {
    (this as unknown as { $emit: (eventName: string) => void; }).$emit('userAction');
  },
}));
jest.mock('sonar-ui/vue', () => ({
  generateRandomId: jest.fn(() => '_abcde'),
  markdown: (value: string): string => value,
  buildClass: (...values: string[]): string => values.join(' '),
}));

describe('vue/containers/Form', () => {
  const onUserAction = jest.fn();
  const customComponents = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loading next step', async () => {
    process.env.LOADING = 'true';
    const preventDefault = jest.fn();
    Event.prototype.preventDefault = preventDefault;
    const wrapper = mount(Form, {
      propsData: {
        configuration: {
          root: 'start',
          steps: {
            start: {
              fields: [],
            },
          },
          fields: {},
        },
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    const form = wrapper.find('form');
    form.trigger('submit');
    delete process.env.LOADING;
    expect(preventDefault).toHaveBeenCalled();
    expect(wrapper.html()).toMatchSnapshot();
    // Reflects configuration change.
    wrapper.setProps({ configuration: {} });
    (wrapper.vm.$props as unknown as { i18n: I18n; }).i18n('test');
    (wrapper.vm.$props as unknown as { i18n: I18n; }).i18n('test', { test: 'test' });
    await wrapper.vm.$nextTick();
    expect(generateRandomId).toHaveBeenCalledTimes(2);
  });

  test('with active step', async () => {
    const wrapper = mount(Form, {
      propsData: {
        configuration: {
          root: 'start',
          steps: {
            start: {
              fields: [],
            },
          },
          fields: {},
        },
        activeStep: 'start',
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
    await wrapper.vm.$destroy();
  });
});
