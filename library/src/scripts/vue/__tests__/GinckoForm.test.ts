/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import DynamicForm from 'scripts/vue/GinckoForm.vue';
import { render, fireEvent, createEvent } from '@testing-library/vue';

describe('vue/Form', () => {
  vi.mock('scripts/core/Engine');
  vi.mock('diox/connectors/vue');
  vi.mock('scripts/vue/FormStep.vue');

  const configuration = {
    id: 'test',
    root: 'start',
    steps: {
      start: {
        fields: {},
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.LOADING;
    Object.assign(console, { warn: vi.fn() });
  });

  test('renders correctly - loading next step', async () => {
    process.env.LOADING = 'true';
    const { container } = render(DynamicForm, { props: { configuration } });
    expect(container.firstChild).toMatchSnapshot();
    const { container: newContainer } = render(DynamicForm, {
      props: { configuration },
      slots: { loader: '<div>LOADING</div>' },
    });
    expect(newContainer.firstChild).toMatchSnapshot();
  });

  test('renders correctly - with active step', async () => {
    const { container } = render(DynamicForm, { props: { configuration, activeStep: 'start' } });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('prevents native form submission', async () => {
    const { container } = render(DynamicForm, { props: { configuration } });
    const form = container.getElementsByTagName('form')[0];
    const event = createEvent.submit(form);
    event.preventDefault = vi.fn();
    await fireEvent(form, event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
