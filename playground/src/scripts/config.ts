import { Configuration } from 'gincko/react';

export default {
  root: 'start',
  valuesLoaderOptions: {
    autoSubmit: true,
  },
  loaderDisplayerOptions: {
    enabled: false,
  },
  reCaptchaHandlerOptions: {
    enabled: true,
    siteKey: '6LeyjDwbAAAAAMB9r2GmEHa8761Y9b_G7vxWomm-',
  },
  steps: {
    start: { fields: ['email', 'next'], nextStep: 'end' },
    mid: { fields: ['azd'], nextStep: 'end' },
    end: { fields: ['address', 'city', 'submit'], submit: true },
  },
  fields: {
    email: {
      type: 'Textfield',
      messages: {
        validation: (value: string) => {
          if (value === 'zz') {
            return 'OKOK';
          }
          if (value === 'ee') {
            return 'KOKO';
          }
          return null;
        },
      },
      options: {
        autocomplete: 'off',
        // transform: (value: string): string => value.replace(/a/g, 'e'),
      },
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
    // (engine: Engine): void => {
    // engine.on('loadedNextStep', (nextStep, next) => {
    //   const newStep = engine.generateStep('mid');
    //   if (newStep !== null) {
    //     engine.updateCurrentStep(newStep);
    //   }
    //   return next(nextStep);
    // });
    // engine.on('error', () => {
    //   throw new Error('Test');
    // });
    // },
  ],
} as Configuration;
