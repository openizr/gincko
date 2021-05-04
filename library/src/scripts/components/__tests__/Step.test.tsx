/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { act } from 'react-dom/test-utils';
import Step from 'scripts/components/Step';
import { render, unmountComponentAtNode } from 'react-dom';

jest.mock('scripts/components/Field', () => {
  return (props: Json) => {
    props.onUserAction();
    return <div id="Field" />;
  };
});
jest.mock('sonar-ui/react', () => {
  return {
    markdown: (value: string): string => value,
    buildClass: (...values: string[]): string => values.join(' '),
  };
});

describe('components/Step', () => {
  let container = document.createElement('div');
  const onUserAction = jest.fn();
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

  test('active step', () => {
    act(() => {
      render(<Step
        id="step"
        status="success"
        isActive={true}
        index={0}
        fields={[{
          id: "Message",
          type: "Unknown",
          status: "initial",
          options: {},
        }]}
        customComponents={customComponents}
        onUserAction={onUserAction}
      />, container);
    });
    expect(container).toMatchSnapshot();
    expect(onUserAction).toHaveBeenCalledTimes(1);
  });

  test('inactive step', () => {
    act(() => {
      render(<Step
        id="step"
        status="success"
        isActive={false}
        index={0}
        fields={[{
          id: "Message",
          type: "Unknown",
          status: "initial",
          options: {},
        }]}
        customComponents={customComponents}
        onUserAction={onUserAction}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });
});
