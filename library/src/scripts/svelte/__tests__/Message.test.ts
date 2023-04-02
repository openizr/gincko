/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/svelte';
import Message from 'scripts/svelte/Message.svelte';

vi.mock('biuty/svelte');

describe('svelte/Message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly - custom props', async () => {
    const { container } = render(Message, { props: { id: 'test', label: '*Test*', modifiers: 'strong' } });
    expect(container.firstChild).toMatchSnapshot();
  });
});
