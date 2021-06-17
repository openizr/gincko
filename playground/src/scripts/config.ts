import { Engine } from 'gincko/react';

export default {
  root: 'start',
  reCaptchaHandlerOptions: {
    enabled: true,
    siteKey: '6LeyjDwbAAAAAMB9r2GmEHa8761Y9b_G7vxWomm-',
  },
  steps: {
    start: { fields: ['email', 'next'], nextStep: 'end' },
    mid: { fields: ['azd'], nextStep: 'end' },
    end: { fields: ['address', 'city', 'next'], submit: true },
  },
  fields: {
    email: {
      type: 'Textfield',
      validation: () => false,
      transform: (value: string) => value.replace(/a/g, 'e'),
      messages: {
        validation: 'OKOK',
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
  },
  plugins: [
    (engine: Engine): void => {
      engine.on('loadedNextStep', (nextStep, next) => {
        const newStep = engine.generateStep('mid');
        if (newStep !== null) {
          engine.updateCurrentStep(newStep);
        }
        return next(nextStep);
      });
      engine.on('error', () => {
        throw new Error('Test');
      });
    },
    (engine: any) => {
      // let timeout: any = null;
      // engine.on('userAction', (us: any, next: any) => {
      //   window.clearTimeout(timeout as any);

      //   return new Promise<void>((resolve) => {
      //     timeout = window.setTimeout(() => {
      //       resolve();
      //     }, 50);
      //   }).then(() => next(us));
      // });
    },
  ],
};
