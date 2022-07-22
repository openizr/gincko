<!-- Tooltips test. -->
<script lang="ts">
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';
import Form from 'scripts/svelte/Form.svelte';

/** Form's active step's id. */
export let activeStep: string | undefined = undefined;

/** Form's configuration. */
export let configuration: Configuration;

/** Internationalization function, used to translate form labels into different languages. */
export let i18n: I18n | undefined = undefined;

/** List of form's custom UI components. */
export let customComponents: CustomComponents | undefined = undefined;

/** Custom gincko form engine class to use instead of the default engine. */
export let engineClass: typeof Engine | undefined = undefined;
</script>

<Form
  {i18n}
  {activeStep}
  {engineClass}
  {configuration}
  {customComponents}
>
  <div slot="loader">LOADING...</div>
</Form>