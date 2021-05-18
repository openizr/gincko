/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { act } from 'react-dom/test-utils';
import Field from 'scripts/react/components/Field';
import { render, unmountComponentAtNode } from 'react-dom';

jest.mock('sonar-ui/react', () => {
  /* eslint-disable react/destructuring-assignment, jsx-a11y/no-static-element-interactions */
  function Component(props: Json): JSX.Element {
    return (
      <div
        id={props.id}
        onClick={props.onClick}
        onKeyDown={props.onFocus}
        data-readonly={props.readonly}
      />
    );
  }
  /* eslint-enable react/destructuring-assignment, jsx-a11y/no-static-element-interactions */

  const markdown = (value: string): string => value;
  const buildClass = (...values: string[]): string => values.join(' ');
  const UIRadio = Component;
  const UIButton = Component;
  const UIDropdown = Component;
  const UICheckbox = Component;
  const UITextfield = Component;
  const UIFileUploader = Component;

  return {
    markdown,
    buildClass,
    UIRadio,
    UIButton,
    UIDropdown,
    UICheckbox,
    UITextfield,
    UIFileUploader,
  };
});

describe('react/components/Field', () => {
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

  test('unknown field type', () => {
    act(() => {
      render(<Field
        active
        id="Message"
        type="Unknown"
        status="initial"
        options={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Message with empty label', () => {
    act(() => {
      render(<Field
        active
        id="Message"
        type="Message"
        status="initial"
        options={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Message with label', () => {
    act(() => {
      render(<Field
        active
        id="Message"
        type="Message"
        status="initial"
        label="Test {{value}}"
        options={{ formValues: { value: 'test' } }}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Button', () => {
    act(() => {
      render(<Field
        active
        id="Button"
        type="Button"
        status="initial"
        label="Test"
        options={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    const div = document.querySelector('#Button') as HTMLButtonElement;
    act(() => {
      div.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container).toMatchSnapshot();
    expect(onUserAction).toHaveBeenCalledTimes(1);
  });

  test('Textfield - active step', () => {
    act(() => {
      render(<Field
        id="Textfield"
        type="Textfield"
        status="initial"
        label="Test"
        options={{}}
        active
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Textfield - active step, readonly option is `true`', () => {
    act(() => {
      render(<Field
        id="Textfield"
        type="Textfield"
        status="initial"
        label="Test"
        options={{ readonly: true }}
        active
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Textfield - with onFocus method, inactive step', () => {
    const onFocus = jest.fn();
    act(() => {
      render(<Field
        id="Textfield"
        type="Textfield"
        status="initial"
        label="Test"
        options={{ onFocus }}
        active={false}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
    expect(onFocus).toHaveBeenCalledTimes(0);
    const div = document.querySelector('#Textfield') as HTMLButtonElement;
    act(() => {
      div.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    });
    expect(container).toMatchSnapshot();
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  test('Textfield - with no onFocus method', () => {
    act(() => {
      render(<Field
        id="Textfield"
        type="Textfield"
        status="initial"
        label="Test"
        options={{}}
        active={false}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    const div = document.querySelector('#Textfield') as HTMLButtonElement;
    act(() => {
      div.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    });
    expect(container).toMatchSnapshot();
  });

  test('FileUploader', () => {
    act(() => {
      render(<Field
        active
        id="FileUploader"
        type="FileUploader"
        status="initial"
        label="Test"
        options={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Dropdown', () => {
    act(() => {
      render(<Field
        active
        id="Dropdown"
        type="Dropdown"
        status="initial"
        label="Test"
        options={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Checkbox', () => {
    act(() => {
      render(<Field
        active
        id="Checkbox"
        type="Checkbox"
        status="initial"
        label="Test"
        options={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Radio', () => {
    act(() => {
      render(<Field
        active
        id="Radio"
        type="Radio"
        status="initial"
        label="Test"
        options={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });
});
