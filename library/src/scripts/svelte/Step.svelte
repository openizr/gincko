<!-- Svelte form step. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { buildClass } from 'biuty/svelte';
import Field from 'scripts/svelte/Field.svelte';

export let i18n: I18n;
export let step: Step;
export let index: number;
export let isActive: boolean;
export let variables: Variables;
export let userInputs: UserInputs;
export let onUserAction: OnUserAction;
export let customComponents: CustomComponents;

$: className = buildClass(
  'gincko__step',
  [step.status, step.id, isActive ? 'active' : ''].join(' '),
);
</script>

<div class={className} id={`${step.id}__${index}`}>
  <div class="gincko__step__fields">
    <!-- Key is composed of both step and field ids, in order to ensure each field is correctly
      reset when user changes his journey in previous steps. -->
    {#each step.fields as field (`${step.id}.${index}.${field?.id}`)}
      {#if field !== null}
      <Field
        {i18n}
        {field}
        {isActive}
        {variables}
        {userInputs}
        {onUserAction}
        {customComponents}
        path={`${step.id}.${index}.${field.id}`}
      />
      {/if}
    {/each}
  </div>
</div>
