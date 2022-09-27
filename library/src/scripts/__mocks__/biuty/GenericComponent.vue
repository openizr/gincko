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
  transform?: Handler;
}>();

const emit = defineEmits({
  focus: null,
  click: null,
  change: null,
  keyDown: null,
});

const computedProps = computed(() => props);

// Covers `onChange` handler.
setTimeout(() => {
  emit('change', 'test');
  if (process.env.IS_DATE === 'true') {
    emit('change', '2020/02/20');
  }
}, 10);

// Covers `onFocus` handler.
emit('focus');

// Covers `onClick` handler.
setTimeout(() => {
  emit('click');
}, 10);

// Covers `transform` function.
if (props.transform !== undefined) {
  props.transform('ok');
  props.transform('1002');
  props.transform('100220');
  props.transform('10022020');
}
// Covers `onKeyDown` handler.
emit('keyDown', { key: '1' });
emit('keyDown', { key: 'A', ctrlKey: false, preventDefault: vi.fn() });
</script>

<template>
  <div>
    {{ JSON.stringify(computedProps) }}
  </div>
</template>
