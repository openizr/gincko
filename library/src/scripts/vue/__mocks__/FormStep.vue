<!-- gincko/vue/FormStep mock. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  Step,
  Variables,
  UserInputs,
  OnUserAction,
} from 'scripts/vue.d';
import { vue } from 'scripts/index.d';

const props = defineProps<{
  step: Step;
  index: number;
  i18n: vue.I18n;
  isActive: boolean;
  variables: Variables;
  userInputs: UserInputs;
  onUserAction: OnUserAction;
  customComponents: vue.CustomComponents;
}>();

// Covers default i18n function.
props.i18n('test');
// Covers userAction callback.
props.onUserAction();

</script>

<template>
  <div id="step">
    {{ JSON.stringify({
      step,
      index,
      isActive,
      variables,
      userInputs,
      customComponents,
    }) }}
  </div>
</template>
