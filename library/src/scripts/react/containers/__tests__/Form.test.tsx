/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { act, Simulate } from 'react-dom/test-utils';
import Form from 'scripts/react/containers/Form';
import { render, unmountComponentAtNode } from 'react-dom';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

jest.mock('scripts/core/Engine');
jest.mock('scripts/react/components/Step', () => ({ onUserAction, i18n }: Any): JSX.Element => {
  i18n('test');
  i18n('test', { test: 'test' });
  onUserAction();
  return <div id="Step" />;
});
jest.mock('sonar-ui/react', () => ({
  generateRandomId: (): string => '_abcde',
  markdown: (value: string): string => value,
  buildClass: (...values: string[]): string => values.join(' '),
}));
jest.mock('diox/connectors/react', () => jest.fn(() => [jest.fn(() => [{
  steps: [{ id: 'start' }, { id: 'end' }],
  loadingNextStep: process.env.LOADING === 'true',
}]), jest.fn()]));

describe('containers/Form', () => {
  let container = document.createElement('div');
  const customComponents = {};

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    jest.clearAllMocks();
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    ((container as unknown) as null) = null;
  });

  test('loading next step', () => {
    process.env.LOADING = 'true';
    const preventDefault = jest.fn();
    act(() => {
      render(<Form
        configuration={{
          id: 'test',
          root: 'start',
          steps: {
            start: {
              fields: [],
            },
          },
          fields: {},
        }}
        customComponents={customComponents}
      />, container);
    });
    act(() => {
      Simulate.submit(document.querySelector('form') as HTMLFormElement, { preventDefault });
    });
    delete process.env.LOADING;
    expect(preventDefault).toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });

  test('with active step', () => {
    act(() => {
      render(<Form
        configuration={{
          root: 'start',
          steps: {
            start: {
              fields: [],
            },
          },
          fields: {},
        }}
        activeStep="start"
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('not loading next step', () => {
    act(() => {
      render(<Form
        configuration={{
          root: 'start',
          steps: {
            start: {
              fields: [],
            },
          },
          fields: {},
        }}
        activeStep="start"
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });
});
