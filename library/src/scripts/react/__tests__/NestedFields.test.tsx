/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import React from 'react';
import NestedFields from 'scripts/react/NestedFields';
import { render, waitFor } from '@testing-library/react';

jest.mock('biuty/react');
jest.mock('scripts/react/Field');

describe('react/NestedFields', () => {
  const onUserAction = jest.fn();
  const userInputs = { test: 'ok' };
  const variables = { var: 'value' };
  const i18n = jest.fn(() => 'TRANSLATED LABEL');

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NOCLICK;
  });

  test('renders correctly - array', async () => {
    const { container } = render(<NestedFields
      t={i18n}
      type="array"
      label="Test"
      helper="Helper"
      path="path.0.to.field"
      variables={variables}
      userInputs={userInputs}
      fields={[{
        id: 'Message',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null]}
      onUserAction={onUserAction}
    />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - array with minItems', async () => {
    const { container } = render(<NestedFields
      t={i18n}
      type="array"
      minItems={2}
      path="path.0.to.field"
      variables={variables}
      userInputs={userInputs}
      fields={[{
        id: 'Message',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }]}
      onUserAction={onUserAction}
    />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - array with maxItems', async () => {
    const { container } = render(<NestedFields
      t={i18n}
      type="array"
      maxItems={1}
      path="path.0.to.field"
      variables={variables}
      userInputs={userInputs}
      value={['test', 'test']}
      fields={[{
        id: 'Message',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null]}
      onUserAction={onUserAction}
    />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - object', async () => {
    const { container } = render(<NestedFields
      t={i18n}
      type="object"
      path="path.0.to.field"
      variables={variables}
      userInputs={userInputs}
      fields={[{
        id: 'Message',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null]}
      onUserAction={onUserAction}
    />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - dynamicObject with valid pattern', async () => {
    process.env.NOCLICK = 'true';
    const { container } = render(<NestedFields
      t={i18n}
      type="dynamicObject"
      path="path.0.to.field"
      variables={variables}
      userInputs={userInputs}
      fields={[{
        id: 'Message',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null]}
      onUserAction={onUserAction}
      allowedPatterns={[/test/]}
    />);
    await waitFor(() => new Promise<void>((resolve) => { setTimeout(resolve, 50); }));
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - dynamicObject with invalid pattern', async () => {
    const { container } = render(<NestedFields
      t={i18n}
      type="dynamicObject"
      path="path.0.to.field"
      variables={variables}
      userInputs={userInputs}
      fields={[{
        id: 'Message',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null]}
      onUserAction={onUserAction}
      addTextfieldProps={{ debounceTimeout: 10, helper: 'INVALID' }}
    />);
    await waitFor(() => new Promise<void>((resolve) => { setTimeout(resolve, 50); }));
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - dynamicObject with error', async () => {
    const { container } = render(<NestedFields
      t={i18n}
      helper="Error"
      modifiers="error"
      type="dynamicObject"
      variables={variables}
      path="path.0.to.field"
      userInputs={userInputs}
      value={{
        test: 'Test',
        test2: 'Test',
      }}
      fields={[{
        id: 'Message',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, {
        id: 'Message2',
        status: 'initial',
        component: 'Message',
        componentProps: {},
      }, null]}
      onUserAction={onUserAction}
    />);
    await waitFor(() => new Promise<void>((resolve) => { setTimeout(resolve, 50); }));
    expect(container.firstChild).toMatchSnapshot();
  });
});
