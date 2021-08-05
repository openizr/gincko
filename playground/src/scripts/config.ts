import { errorStepDisplayer } from 'gincko/plugins';
import { Configuration, Plugin } from 'gincko/react';

export default <Configuration>{
  root: 'start',
  steps: {
    start: { fields: ['email', 'mess', 'next'], nextStep: 'end' },
    mid: { fields: ['azd'], nextStep: 'end' },
    end: { fields: ['address', 'city', 'submit'], submit: true },
    error: { fields: ['msg', 'next'] },
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
        transform: (value: string): string => value.replace(/a/g, 'e'),
      },
    },
    mess: {
      type: 'Message',
      label: '{{email}} - {{test}}',
    },
    msg: {
      type: 'Message',
      label: 'error',
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
  plugins: [
    errorStepDisplayer({ setActiveStep: () => '', stepId: 'error' }),
    ((engine) => {
      engine.on('userAction', (userAction, next) => {
        if (userAction?.fieldId === 'city') {
          throw new Error('ok');
        }
        if (userAction !== null) {
          const currentStep = engine.getCurrentStep();
          currentStep.fields[1].options.formValues = {
            ...engine.getValues(),
            [userAction.fieldId]: userAction.value,
          };
          engine.setCurrentStep(currentStep);
        }
        return next(userAction);
      });
    }) as Plugin,
  ],
};
