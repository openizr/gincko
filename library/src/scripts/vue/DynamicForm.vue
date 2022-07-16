<!-- Vue form. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { vue } from 'scripts/index.d';
import Engine from 'scripts/core/Engine';
import useStore from 'diox/connectors/vue';
import FormStep from 'scripts/vue/FormStep.vue';
import { StateState } from 'scripts/core/state';
import { Configuration, UserInput } from 'scripts/vue.d';

const props = defineProps<{
  /** Form's active step's id. */
  activeStep?: string | null;

  /** Form's configuration. */
  configuration: Configuration,

  /** Internationalization function, used to translate form labels into different languages. */
  i18n?: vue.I18n;

  /** List of form's custom UI components. */
  customComponents?: vue.CustomComponents;

  /** Custom gincko form engine class to use instead of the default engine. */
  engineClass?: typeof Engine;
}>();

const EngineClass = props.engineClass || Engine;
const engine = new EngineClass(props.configuration);
const useCombiner = useStore(engine.getStore());
const state = useCombiner<StateState>('state');

const onUserAction = (type: string, path: string, data: UserInput): void => {
  engine.getStore().mutate('userActions', 'ADD', { type, path, data });
};

const preventSubmit = (event: Event): void => {
  event.preventDefault();
};
</script>

<template>
  <form
    :id="configuration.id"
    class="gincko"
    @submit="preventSubmit"
  >
    <div class="gincko__steps">
      <FormStep
        v-for="(step, index) in state.steps"
        :key="`${step.id}.${index}`"
        :step="step"
        :index="index"
        :variables="state.variables"
        :on-user-action="onUserAction"
        :user-inputs="state.userInputs"
        :i18n="i18n || ((label) => label)"
        :is-active="((activeStep || null) !== null)
          ? activeStep === step.id
          : index === state.steps.length - 1"
        :custom-components="customComponents || {}"
      />

      <slot
        v-if="state.loading"
        name="loader"
      />
    </div>
  </form>
</template>
