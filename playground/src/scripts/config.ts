import { Engine } from 'gincko/react';

export default {
  root: 'start',
  steps: {
    start: { fields: ['email', 'next'], nextStep: 'end' },
    mid: { fields: ['azd'], nextStep: 'end' },
    end: { fields: ['address', 'city', 'next'] },
  },
  fields: {
    email: {
      type: 'Textfield',
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
  ],
};
