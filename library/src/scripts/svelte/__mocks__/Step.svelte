<!-- gincko/svelte/Step mock. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export let i18n: I18n;
export let step: Step;
export let index: number;
export let isActive: boolean;
export let variables: Variables;
export let userInputs: UserInputs;
export let onUserAction: OnUserAction;
export let customComponents: CustomComponents;

// Covers default i18n function.
i18n('test');
// Covers userAction callback.
onUserAction('input', 'path.to.field', null);
</script>

<div id="step">
  {JSON.stringify({
    step,
    index,
    isActive,
    variables,
    userInputs,
    customComponents,
  })}
</div>
