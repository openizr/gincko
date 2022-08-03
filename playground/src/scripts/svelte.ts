import configuration from 'scripts/config';
import Form, { Variables } from 'gincko/svelte';

let app: Form;

const translate = (label: string, variables: Variables = {}): string => {
  let translatedLabel = label;
  Object.keys(variables).forEach((variable) => {
    translatedLabel = translatedLabel.replace(`{{${variable}}}`, variables[variable] as string);
  });
  return translatedLabel;
};

function main(): void {
  app = new Form({
    props: {
      configuration,
      i18n: translate,
    },
    target: document.getElementById('root') as HTMLElement,
  });
}

// Ensures DOM is fully loaded before running app's main logic.
// Loading hasn't finished yet...
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
  // `DOMContentLoaded` has already fired...
} else {
  main();
}

// Ensures subscriptions to Store are correctly cleared when page is left, to prevent "ghost"
// processing, by manually unmounting Vue components tree.
window.addEventListener('beforeunload', () => {
  app.$destroy();
});
