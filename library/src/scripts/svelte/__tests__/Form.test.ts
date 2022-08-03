/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import Form from 'scripts/svelte/__tests__/TestForm.svelte';
import { render, fireEvent, createEvent } from '@testing-library/svelte';

jest.mock('scripts/core/Engine');
jest.mock('diox/connectors/svelte');
jest.mock('scripts/svelte/Step.svelte');

describe('svelte/Form', () => {
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
    jest.clearAllMocks();
    delete process.env.LOADING;
  });

  test('renders correctly - loading next step', async () => {
    process.env.LOADING = 'true';
    const { container } = render(Form, { props: { configuration } });
    expect(container.firstChild).toMatchSnapshot();
    const { container: newContainer } = render(Form, { props: { configuration } });
    expect(newContainer.firstChild).toMatchSnapshot();
  });

  test('renders correctly - with active step', async () => {
    const { container } = render(Form, { props: { configuration, activeStep: 'start' } });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('prevents native form submission', async () => {
    const { container } = render(Form, { props: { configuration } });
    const form = container.getElementsByTagName('form')[0];
    const event = createEvent.submit(form);
    event.preventDefault = jest.fn();
    await fireEvent(form, event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
