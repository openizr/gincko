/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/vue';
import FormStep from 'scripts/vue/FormStep.vue';

vi.mock('biuty/vue');
vi.mock('scripts/core/Engine');
vi.mock('scripts/vue/FormField.vue');

describe('vue/FormStep', () => {
  const customComponents = {};
  const userInputs = { test: 'ok' };
  const variables = { var: 'value' };
  const i18n = vi.fn(() => 'TRANSLATED LABEL');
  const onUserAction = vi.fn() as unknown as OnUserAction;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, { warn: vi.fn() });
  });

  test('renders correctly - active step', async () => {
    const { container } = render(FormStep, {
      props: {
        index: 0,
        isActive: true,
        step: {
          id: 'step',
          status: 'success',
          fields: [{
            id: 'Message',
            status: 'initial',
            component: 'Message',
            componentProps: {},
          }],
        },
        i18n,
        variables,
        userInputs,
        onUserAction,
        customComponents,
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - inactive step', async () => {
    const { container } = render(FormStep, {
      props: {
        index: 0,
        step: {
          id: 'step',
          status: 'success',
          fields: [{
            id: 'Message',
            status: 'initial',
            component: 'Message',
            componentProps: {},
          }, null],
        },
        i18n,
        variables,
        userInputs,
        onUserAction,
        isActive: false,
        customComponents,
      },
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
