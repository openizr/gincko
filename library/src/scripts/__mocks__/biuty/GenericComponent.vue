<!-- biuty component mock. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { computed } from 'vue';

type Handler = (value?: string) => string;

const props = defineProps<{
  onFocus?: Handler;
  onClick?: Handler;
  onChange?: Handler;
}>();

const emit = defineEmits({
  focus: null,
  click: null,
  change: null,
});

const computedProps = computed(() => props);

// Covers `onChange` handler.
setTimeout(() => {
  emit('change', 'test');
}, 10);

// Covers `onFocus` handler.
emit('focus');

// Covers `onClick` handler.
setTimeout(() => {
  emit('click');
}, 10);

</script>

<template>
  <div>
    {{ JSON.stringify(computedProps) }}
  </div>
</template>
