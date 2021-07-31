import { Configuration } from 'gincko/react';

export default <Configuration>{
  root: 'start',
  autoFill: true,
  restartOnReload: true,
  steps: {
    start: { fields: ['email', 'mess', 'next'], nextStep: 'end' },
    mid: { fields: ['azd'], nextStep: 'end' },
    end: { fields: ['address', 'city', 'submit'], submit: true },
  },
  fields: {
    email: {
      type: 'Textfield',
      required: true,
      loadNextStep: true,
      // value: 'test',
      messages: {
        validation: (value): string | null => (value.trim() === '' ? 'Please enter a valid email' : null),
      },
      options: {
        debounceTimeout: 1000,
        autocomplete: 'off',
        // transform: (value: string): string => value.replace(/a/g, 'e'),
      },
    },
    mess: {
      type: 'Message',
      label: '{{email}} - {{test}}',
    },
    address: {
      type: 'Textfield',
    },
    city: {
      type: 'Textfield',
    },
    next: {
      type: 'Button',
      label: 'Next',
      loadNextStep: true,
      options: {
        modifiers: 'disabled',
      },
    },
    submit: {
      type: 'Button',
      label: 'Submit',
    },
  },
};
