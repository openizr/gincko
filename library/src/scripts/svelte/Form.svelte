<!-- Svelte form. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';
import useStore from 'diox/connectors/svelte';
import Step from 'scripts/svelte/Step.svelte';
import { StateState } from 'scripts/core/state';

const defaultI18n = (label: string): string => label;

/** Form's active step's id. */
export let activeStep: string | null = null;

/** Form's configuration. */
export let configuration: Configuration;

/** Internationalization function, used to translate form labels into different languages. */
export let i18n: I18n = defaultI18n;

/** List of form's custom UI components. */
export let customComponents: CustomComponents = {};

/** Custom gincko form engine class to use instead of the default engine. */
export let engineClass: typeof Engine = Engine;

// Enforces props default values.
$: i18n = i18n || defaultI18n;
$: activeStep = activeStep || null;
$: engineClass = engineClass || Engine;
$: customComponents = customComponents || {};

const EngineClass = engineClass;
const engine = new EngineClass(configuration);
const useCombiner = useStore(engine.getStore());
const state = useCombiner<StateState>('state');

const onUserAction = (type: string, path: string, data: UserInput): void => {
  engine.getStore().mutate('userActions', 'ADD', { type, path, data });
};

const preventSubmit = (event: Event): void => {
  event.preventDefault();
};
</script>

<form class="gincko" id={configuration.id} on:submit={preventSubmit}>
  <div class="gincko__steps">
    {#each $state.steps as step, index (`${step.id}.${index}`)}
      <Step
        {step}
        {index}
        i18n={i18n}
        {onUserAction}
        variables={$state.variables}
        userInputs={$state.userInputs}
        customComponents={customComponents}
        isActive={activeStep !== null ? activeStep === step.id : index === $state.steps.length - 1}
      />
    {/each}

    {#if $state.loading && $$slots.loader}
      <slot name="loader" />
    {/if}
  </div>
</form>
