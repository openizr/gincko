import { Configuration, Engine } from 'gincko/react';

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
    },
    submit: {
      type: 'Button',
      label: 'Submit',
      loadNextStep: true,
    },
  },
  plugins: [
    (engine: Engine): void => {
      engine.on('userAction', (userAction, next) => {
        console.log('US', userAction);
        return next(userAction);
      });
      engine.on('loadedNextStep', (nextStep, next) => next(nextStep).then(() => {
        console.log('OKOK');
        setTimeout(() => {
          // if (nextStep.id === 'start') {
          //   console.log('US', engine.userAction({
          //     type: 'input', value: 'TEST', fieldId: 'email', stepIndex: 0,
          //   }));
          // }
          engine.setValues({ test: 'zokazfok' });
        }, 1000);
        setTimeout(() => {
          console.log(engine.getValues());
        }, 2000);
        return Promise.resolve(nextStep);
      }));
      // setTimeout(() => {
      //   engine.loadValues({ test: 'ok', email: 'zjfdzo' });
      //   engine.getValues();
      // }, 2000);
    },
  ],
} as Configuration;
