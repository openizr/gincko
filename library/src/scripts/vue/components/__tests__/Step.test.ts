/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Component } from 'vue';
import { mount } from '@vue/test-utils';
import Step from 'scripts/vue/components/Step.vue';

type ComponentApi = {
  attrs: {
    id?: string;
  };
};

jest.mock('scripts/vue/components/Field', () => ({
  render(createElement: (tag: string, api: ComponentApi) => Component): Component {
    return createElement('div', {
      attrs: {
        id: 'Field',
      },
    });
  },
  mounted(): void {
    (this as unknown as { $emit: (eventName: string) => void; }).$emit('userAction');
  },
}));
jest.mock('sonar-ui/vue', () => ({
  markdown: (value: string): string => value,
  buildClass: (...values: string[]): string => values.join(' '),
}));

describe('vue/components/Step', () => {
  const onUserAction = jest.fn();
  const customComponents = {};
  const i18n = (): string => 'Test';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('active step', () => {
    const wrapper = mount(Step, {
      propsData: {
        i18n,
        id: 'step',
        status: 'success',
        isActive: true,
        index: 0,
        fields: [{
          id: 'Message',
          type: 'Unknown',
          status: 'initial',
          options: {},
        }],
        customComponents,
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  test('inactive step', () => {
    const wrapper = mount(Step, {
      propsData: {
        i18n,
        id: 'step',
        status: 'success',
        isActive: false,
        index: 0,
        fields: [{
          id: 'Message',
          type: 'Unknown',
          status: 'initial',
          options: {},
        }],
      },
      listeners: {
        userAction: onUserAction,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
