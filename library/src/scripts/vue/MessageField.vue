<!-- Message field type. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { buildClass, markdown } from 'biuty/vue';

withDefaults(defineProps<{
  id: string;
  label: string;
  modifiers?: string;
}>(), {
  modifiers: '',
});
</script>

<template>
  <section
    :id="id"
    :class="buildClass('ui-message', modifiers)"
    v-html="markdown(label, false)"
  />
</template>
