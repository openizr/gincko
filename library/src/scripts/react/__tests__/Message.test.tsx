/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import React from 'react';
import Message from 'scripts/react/Message';
import { render } from '@testing-library/react';

vi.mock('biuty/react');

describe('react/Message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly - default props', async () => {
    const { container } = render(<Message id="test" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - custom props', async () => {
    const { container } = render(<Message id="test" label="*Test*" modifiers="strong" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
