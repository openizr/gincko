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

/** Generated field. */
export let field: Field;

/** Field's path. */
export let path: string;

/** Internationalization function, used for labels translation. */
export let i18n: I18n;

/** Whether field belongs to the active step. */
export let isActive: boolean;

/** Form variables. */
export let variables: Variables;

/** List of user inputs. */
export let userInputs: UserInputs;

/** Callback to trigger at each user action. */
export let onUserAction: OnUserAction;

/** List of form's custom UI components. */
export let customComponents: CustomComponents;

let actualField: Any;
let message: string | null;
let allComponents: CustomComponents;

$: allComponents = { ...builtInComponents, ...customComponents };
$: allValues = { ...variables, ...userInputs };
$: label = (field.label !== undefined) ? i18n(field.label, allValues) : null;
$: {
  const helper = field.message || field.componentProps.helper;
  message = (helper !== undefined) ? i18n(helper, allValues) : null;
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
      label: label as string,
      message: message as string,
      allValues,
      variables,
      userInputs,
      customComponents,
      componentProps: field.componentProps,
    }, onUserAction);
  }
}
</script>

{#if actualField !== null}
<svelte:component
  this={actualField.component}
  {...actualField.props}
  on:focus={focusField}
  on:change={actualField.events.change}
  on:click={actualField.events.click}
  on:paste={actualField.events.paste}
  on:blur={actualField.events.blur}
  on:keyDown={actualField.events.keyDown}
  on:iconClick={actualField.events.iconClick}
  on:iconKeyDown={actualField.events.iconKeyDown}
/>
{/if}
