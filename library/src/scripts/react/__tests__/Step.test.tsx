/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import React from 'react';
import Step from 'scripts/react/Step';
import { render } from '@testing-library/react';

jest.mock('biuty/react');
jest.mock('scripts/core/Engine');
jest.mock('scripts/react/Field');

const JSXStep = Step as JSXElement;

describe('react/Step', () => {
  const customComponents = {};
  const userInputs = { test: 'ok' };
  const variables = { var: 'value' };
  const i18n = jest.fn(() => 'TRANSLATED LABEL');
  const onUserAction = jest.fn() as unknown as OnUserAction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly - active step', async () => {
    const { container } = render(<JSXStep
      index={0}
      isActive
      step={{
        id: 'step',
        status: 'success',
        fields: [{
          id: 'Message',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }],
      }}
      i18n={i18n}
      variables={variables}
      userInputs={userInputs}
      onUserAction={onUserAction}
      customComponents={customComponents}
    />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - inactive step', async () => {
    const { container } = render(<JSXStep
      index={0}
      step={{
        id: 'step',
        status: 'success',
        fields: [{
          id: 'Message',
          status: 'initial',
          component: 'Message',
          componentProps: {},
        }, null],
      }}
      i18n={i18n}
      isActive={false}
      variables={variables}
      userInputs={userInputs}
      onUserAction={onUserAction}
      customComponents={customComponents}
    />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
