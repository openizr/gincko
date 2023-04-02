/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/vue';
import MessageField from 'scripts/vue/MessageField.vue';

vi.mock('biuty/vue');

describe('vue/MessageField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly - default props', async () => {
    const { container } = render(MessageField, { props: { id: 'test', label: '*Test*' } });
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders correctly - custom props', async () => {
    const { container } = render(MessageField, { props: { id: 'test', label: '*Test*', modifiers: 'strong' } });
    expect(container.firstChild).toMatchSnapshot();
  });
});
