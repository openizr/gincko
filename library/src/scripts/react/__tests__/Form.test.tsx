/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import React from 'react';
import Form from 'scripts/react/Form';
import { render, fireEvent, createEvent } from '@testing-library/react';

jest.mock('scripts/react/Step');
jest.mock('scripts/core/Engine');
jest.mock('diox/connectors/react');

const JSXForm = Form as JSXElement;

describe('react/Form', () => {
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
    const { container, rerender } = render(<JSXForm configuration={configuration} />);
    expect(container.firstChild).toMatchSnapshot();
    // Covers React.memo checks.
    await rerender(<JSXForm configuration={configuration} />);
    await rerender(<JSXForm configuration={configuration} loader={<div>LOADING</div>} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - with active step', async () => {
    const { container } = render(<JSXForm configuration={configuration} activeStep="start" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('prevents native form submission', async () => {
    const { container } = render(<JSXForm configuration={configuration} />);
    const form = await container.getElementsByTagName('form')[0];
    const event = createEvent.submit(form);
    event.preventDefault = jest.fn();
    await fireEvent(form, event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
