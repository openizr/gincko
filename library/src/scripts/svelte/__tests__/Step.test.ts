/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/svelte';
import Step from 'scripts/svelte/Step.svelte';

vi.mock('biuty/svelte');
vi.mock('scripts/core/Engine');
vi.mock('scripts/svelte/Field.svelte');

describe('svelte/Step', () => {
  const customComponents = {};
  const userInputs = { test: 'ok' };
  const variables = { var: 'value' };
  const i18n = vi.fn(() => 'TRANSLATED LABEL');
  const onUserAction = vi.fn() as unknown as OnUserAction;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly - active step', async () => {
    const { container } = render(Step, {
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
    const { container } = render(Step, {
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
