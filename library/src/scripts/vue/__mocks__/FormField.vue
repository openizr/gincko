<!-- gincko/vue/FormField mock. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  Field,
  Variables,
  UserInputs,
  OnUserAction,
} from 'scripts/vue.d';
import { vue } from 'scripts/index.d';

defineProps<{
  field: Field;
  path: string;
  i18n: vue.I18n;
  isActive: boolean;
  variables: Variables;
  userInputs: UserInputs;
  onUserAction: OnUserAction;
  customComponents: vue.CustomComponents;
}>();

</script>

<template>
  <div id="field">
    {{ JSON.stringify({
      field,
      path,
      i18n,
      isActive,
      variables,
      userInputs,
      onUserAction,
      customComponents,
    }) }}
  </div>
</template>
