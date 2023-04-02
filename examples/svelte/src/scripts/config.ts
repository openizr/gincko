// import { errorStepDisplayer } from 'gincko/plugins';
import { Configuration } from 'gincko/core';

export default <Configuration>{
  root: 'start',
  steps: {
    start: {
      fields: {
        email: {
          type: 'string',
          component: 'Textfield',
          required: true,
          submit: true,
          // value: 'test',
          messages: {
            validation(value) {
              return (value.trim() === '' ? 'Please enter a valid email' : null);
            },
          },
          componentProps: {
            debounceTimeout: 1000,
            autocomplete: 'off',
            transform(value: string) {
              return [value.replace(/a/g, 'e')];
            },
          },
        },
        mess: {
          type: 'null',
          component: 'Message',
          label: '{{email}} - {{test}}',
        },
        dynamic: {
          type: 'dynamicObject',
          component: 'DynamicObject',
          componentProps: {
            allowedPatterns: [/test/],
            addButtonProps: {
              label: 'ADD',
            },
          },
          fields: {
            test: {
              type: 'string',
              component: 'Null',
            },
          },
        },
        next: {
          type: 'boolean',
          component: 'Button',
          label: 'Next',
          submit: true,
          componentProps: {
            modifiers: 'disabled',
          },
        },
      },
      nextStep: 'end',
    },
    end: {
      fields: {
        address: {
          type: 'string',
          component: 'Null',
        },
        city: {
          type: 'string',
          component: 'Null',
        },
        submit: {
          submit: true,
          type: 'boolean',
          component: 'Button',
          label: 'Submit',
        },
      },
      submit: true,
    },
    error: {
      fields: {
        msg: {
          type: 'null',
          component: 'Message',
          label: 'error',
        },
        next: {
          type: 'boolean',
          component: 'Button',
          label: 'Next',
          submit: true,
          componentProps: {
            modifiers: 'disabled',
          },
        },
      },
    },
  },
};
