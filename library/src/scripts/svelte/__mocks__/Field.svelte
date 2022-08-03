<!-- gincko/svelte/Field mock. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export let i18n: I18n;
export let field: Field;
export let path: string;
export let isActive: boolean;
export let variables: Variables;
export let userInputs: UserInputs;
export let onUserAction: OnUserAction;
export let customComponents: CustomComponents;
</script>

<div id="field">
  {JSON.stringify({
    field,
    path,
    i18n,
    isActive,
    variables,
    userInputs,
    onUserAction,
    customComponents,
  })}
</div>
