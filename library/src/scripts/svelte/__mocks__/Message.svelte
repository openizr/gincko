<!-- gincko/svelte/Message mock. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export let label = '';
export let id: string;
export let modifiers = '';
</script>

<div id="field">
  {JSON.stringify({ id, label, modifiers })}
</div>
