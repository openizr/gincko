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

type Handler = (value?: string) => void;
type KeyDownHandler = (value: string, event: unknown) => void;

const props = defineProps<{
  transform?: Handler;
  onChange?: Handler;
  onFocus?: Handler;
  onBlur?: Handler;
  onClick?: Handler;
  onKeyDown?: KeyDownHandler;
}>();

const computedProps = computed(() => props);

// Covers `onChange` handler.
setTimeout(() => {
  props.onChange?.('test');
  if (process.env.IS_DATE === 'true') {
    props.onChange?.('2020/02/20');
  }
}, 10);

// Covers `onFocus` handler.
props.onFocus?.();

// Covers `onBlur` handler.
props.onBlur?.();

// Covers `onClick` handler.
setTimeout(() => {
  props.onClick?.();
}, 10);

// Covers `transform` function.
props.transform?.('ok');
props.transform?.('1002');
props.transform?.('100220');
props.transform?.('10022020');

// Covers `onKeyDown` handler.
props.onKeyDown?.('', { key: '1' });
props.onKeyDown?.('', { key: 'A', ctrlKey: false, preventDefault: vi.fn() });
</script>

<template>
  <div>
    {{ JSON.stringify(computedProps) }}
  </div>
</template>
