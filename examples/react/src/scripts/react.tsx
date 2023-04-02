import * as React from 'react';
import configuration from 'scripts/config';
import Form, { Variables } from 'gincko/react';
import { createRoot, Root } from 'react-dom/client';

let app: Root;

const translate = (label: string, variables: Variables = {}): string => {
  let translatedLabel = label;
  Object.keys(variables).forEach((variable) => {
    translatedLabel = translatedLabel.replace(`{{${variable}}}`, variables[variable] as string);
  });
  return translatedLabel;
};

function main(): void {
  app = createRoot(document.querySelector('#root') as HTMLElement);
  app.render(
    <React.StrictMode>
      <Form configuration={configuration} i18n={translate} />
    </React.StrictMode>,
  );
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
// processing, by manually unmounting React components tree.
window.addEventListener('beforeunload', () => {
  app.unmount();
});
