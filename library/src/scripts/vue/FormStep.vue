<!-- Vue form step. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { computed } from 'vue';
import { buildClass } from 'biuty/vue';
import FormField from 'scripts/vue/FormField.vue';

const props = withDefaults(defineProps<{
  i18n: I18n;
  step: Step;
  index: number;
  isActive: boolean;
  variables: Variables;
  userInputs: UserInputs;
  onUserAction: OnUserAction;
  customComponents: CustomComponents;
}>(), {});

const modifiers = computed(() => [
  props.step.status,
  props.step.id,
  props.isActive ? 'active' : '',
].join(' '));

</script>

<template>
  <div
    :id="`${step.id}__${index}`"
    :class="buildClass('gincko__step', modifiers)"
  >
    <div class="gincko__step__fields">
      <!-- Key is composed of both step and field ids, in order to ensure each field is correctly
      reset when user changes his journey in previous steps. -->
      <FormField
        v-for="field in step.fields.filter((field) => field !== null)"
        :key="`${step.id}.${index}.${field.id}`"
        :i18n="i18n"
        :field="field"
        :is-active="isActive"
        :variables="variables"
        :user-inputs="userInputs"
        :on-user-action="onUserAction"
        :custom-components="customComponents"
        :path="`${step.id}.${index}.${field.id}`"
      />
    </div>
  </div>
</template>
