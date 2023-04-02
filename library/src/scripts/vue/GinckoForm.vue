<!-- Vue form. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';
import useStore from 'diox/connectors/vue';
import FormStep from 'scripts/vue/FormStep.vue';
import { StateState } from 'scripts/core/state';

const props = withDefaults(defineProps<{
  i18n?: I18n;
  activeStep?: string;
  engineClass?: typeof Engine;
  configuration: Configuration,
  customComponents?: CustomComponents;
}>(), {
  i18n: (label) => label,
  activeStep: undefined,
  customComponents: {},
  engineClass: Engine,
});

const engine = new props.engineClass(props.configuration);
const useSubscription = useStore(engine.getStore());
const state = useSubscription<StateState>('state');

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
        :i18n="i18n"
        :variables="state.variables"
        :on-user-action="onUserAction"
        :user-inputs="state.userInputs"
        :is-active="(activeStep !== undefined)
          ? activeStep === step.id : index === state.steps.length - 1"
        :custom-components="customComponents"
      />
      <slot
        v-if="state.loading"
        name="loader"
      />
    </div>
  </form>
</template>
