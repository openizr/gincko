/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react-dom/test-utils';
import Field from 'scripts/react/components/Field';
import { render, unmountComponentAtNode } from 'react-dom';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

jest.mock('sonar-ui/react', () => {
  /* eslint-disable react/destructuring-assignment, jsx-a11y/no-static-element-interactions */
  function Component(props: Any): JSX.Element {
    if (props.onChange !== undefined) {
      props.onChange();
    }
    return (
      <div
        id={props.id}
        onClick={props.onClick}
        onKeyDown={props.onFocus}
        data-readonly={props.readonly}
        data-debounce-timeout={props.debounceTimeout}
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
  const UITextarea = Component;
  const UIFileUploader = Component;

  return {
    markdown,
    buildClass,
    UIRadio,
    UIButton,
    UIDropdown,
    UICheckbox,
    UITextarea,
    UITextfield,
    UIFileUploader,
  };
});

describe('react/components/Field', () => {
  const i18n = jest.fn((label) => label);
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
        i18n={i18n}
        id="Message"
        type="Unknown"
        status="initial"
        options={{}}
        allValues={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Message with no label', () => {
    act(() => {
      render(<Field
        active
        i18n={i18n}
        id="Message"
        type="Message"
        status="initial"
        options={{}}
        allValues={{}}
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
        allValues={{}}
        i18n={(): string => 'Test test'}
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
        i18n={i18n}
        id="Button"
        type="Button"
        status="initial"
        label="Test"
        options={{}}
        allValues={{}}
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
        i18n={i18n}
        onUserAction={onUserAction}
        allValues={{}}
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
        i18n={i18n}
        options={{ readonly: true, placeholder: 'Test' }}
        active
        allValues={{}}
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
        i18n={i18n}
        options={{ onFocus }}
        active={false}
        allValues={{}}
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
        i18n={i18n}
        options={{}}
        active={false}
        allValues={{}}
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

  test('Textarea - active step', () => {
    act(() => {
      render(<Field
        id="Textarea"
        type="Textarea"
        status="initial"
        label="Test"
        options={{}}
        i18n={i18n}
        active
        allValues={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Textarea - active step, readonly option is `true`', () => {
    act(() => {
      render(<Field
        id="Textarea"
        type="Textarea"
        status="initial"
        label="Test"
        options={{ readonly: true, placeholder: 'Test' }}
        i18n={i18n}
        active
        allValues={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('Textarea - with onFocus method, inactive step', () => {
    const onFocus = jest.fn();
    act(() => {
      render(<Field
        id="Textarea"
        type="Textarea"
        status="initial"
        label="Test"
        i18n={i18n}
        options={{ onFocus }}
        active={false}
        allValues={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
    expect(onFocus).toHaveBeenCalledTimes(0);
    const div = document.querySelector('#Textarea') as HTMLButtonElement;
    act(() => {
      div.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    });
    expect(container).toMatchSnapshot();
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  test('Textarea - with no onFocus method', () => {
    act(() => {
      render(<Field
        id="Textarea"
        type="Textarea"
        status="initial"
        label="Test"
        i18n={i18n}
        options={{}}
        active={false}
        allValues={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    const div = document.querySelector('#Textarea') as HTMLButtonElement;
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
        i18n={i18n}
        allValues={{}}
        options={{ helper: 'Test' }}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });

  test('FileUploader - with placeholder', () => {
    act(() => {
      render(<Field
        active
        id="FileUploader"
        type="FileUploader"
        status="initial"
        label="Test"
        i18n={i18n}
        allValues={{}}
        options={{ helper: 'Test', placeholder: 'Test' }}
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
        i18n={i18n}
        options={{
          options: [
            { type: 'option', label: 'Test' },
            { type: 'divider' },
          ],
        }}
        allValues={{}}
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
        options={{
          options: [
            { type: 'option', label: 'Test' },
            { type: 'divider' },
          ],
        }}
        i18n={i18n}
        allValues={{}}
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
        i18n={i18n}
        options={{
          options: [
            { type: 'option', label: 'Test' },
            { type: 'divider' },
          ],
        }}
        allValues={{}}
        onUserAction={onUserAction}
        customComponents={customComponents}
      />, container);
    });
    expect(container).toMatchSnapshot();
  });
});
