<!-- gincko/vue/NestedFields mock. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { computed } from 'vue';

const props = defineProps<{ path?: string; }>();
const computedProps = computed(() => props);
</script>

<template>
  <div id="field">
    {{ JSON.stringify(computedProps) }}
  </div>
</template>
