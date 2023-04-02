<!-- Message field type. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { buildClass, markdown } from 'biuty/svelte';

export let label: string;
export let modifiers = '';
export let id: string | undefined;

// Enforces props default values.
$: modifiers = modifiers ?? '';

$: parsedLabel = markdown(label, false);
$: className = buildClass('ui-message', modifiers);
</script>

<section {id} class={className}>
  {@html parsedLabel}
</section>
