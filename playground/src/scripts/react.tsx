import * as React from 'react';
import Form from 'gincko/react';
import * as ReactDOM from 'react-dom';
import configuration from 'scripts/config';

// Webpack HMR interface.
interface ExtendedNodeModule extends NodeModule {
  hot: { accept: () => void };
}

function main(): void {
  ReactDOM.render(<Form
    configuration={configuration}
  />, document.querySelector('#root'));
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
  ReactDOM.unmountComponentAtNode(document.querySelector('#root') as Element);
});

// Enables Hot Module Rendering.
if ((module as ExtendedNodeModule).hot) {
  (module as ExtendedNodeModule).hot.accept();
}
