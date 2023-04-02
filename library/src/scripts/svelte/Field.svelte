<!-- Svelte form field. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import builtInComponents from 'scripts/svelte/Components';

export let field: Field;
export let path: string;
export let i18n: I18n;
export let isActive: boolean;
export let variables: Variables;
export let userInputs: UserInputs;
export let onUserAction: OnUserAction;
export let customComponents: CustomComponents;

let actualField: JSXElement;
let message: string | undefined;
let allComponents: CustomComponents;

$: allComponents = { ...builtInComponents, ...customComponents };
$: allValues = { ...variables, ...userInputs };
$: label = (field.label !== undefined) ? i18n(field.label, allValues) : undefined;
$: {
  const helper = field.message || field.componentProps.helper;
  message = (helper !== undefined) ? i18n(helper, allValues) : undefined;
}

// The following lines prevent browsers auto-fill system from changing fields
// located in other steps, resetting previous steps and breaking overall UX.
const focusField = (focusedValue: UserInput): void => {
  isActive = true;
  if (field.componentProps['on:focus'] !== undefined) {
    field.componentProps['on:focus'](focusedValue);
  }
};

$: {
  const componentProps = {
    ...field.componentProps, onFocus: focusField,
  };
  // Unknown field type...
  if (allComponents[field.component] === undefined) {
    actualField = null;
  } else {
    // Registered field type...
    actualField = allComponents[field.component]({
      ...field,
      isActive,
      path,
      i18n,
      label,
      message,
      allValues,
      variables,
      userInputs,
      componentProps,
      customComponents,
    }, onUserAction);
  }
}
</script>

{#if actualField !== null}
<svelte:component
  this={actualField.component}
  {...actualField.props}
  on:focus={focusField}
/>
{/if}
