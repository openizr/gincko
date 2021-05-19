export default {
  root: 'start',
  steps: {
    start: { fields: ['email', 'next'], nextStep: 'end' },
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
  plugins: [],
};
