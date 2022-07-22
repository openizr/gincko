<!-- gincko/vue/MessageField mock. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

defineProps<{
  id: string;
  label?: string;
  modifiers?: string;
}>();
</script>

<template>
  <div id="field">
    {{ JSON.stringify({ id, label, modifiers }) }}
  </div>
</template>
