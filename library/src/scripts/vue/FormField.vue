<!-- Vue form field. -->
<script lang="ts" setup>
/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { computed, watch, ref } from 'vue';
import builtInComponents from 'scripts/vue/Components';

const props = withDefaults(defineProps<{
  field: Field;
  path: string;
  i18n: I18n;
  isActive: boolean;
  variables: Variables;
  userInputs: UserInputs;
  onUserAction: OnUserAction;
  customComponents: CustomComponents;
}>(), {});

const allComponents = computed(() => ({
  ...props.customComponents,
  ...builtInComponents,
}));
const allValues = computed(() => ({ ...props.variables, ...props.userInputs }));
const label = computed(() => ((props.field.label !== undefined)
  ? props.i18n(props.field.label, allValues.value)
  : undefined
));
const message = computed(() => {
  const helper = props.field.message || props.field.componentProps.helper;
  return (helper !== undefined) ? props.i18n(helper, allValues.value) : undefined;
});

// The following lines prevent browsers auto-fill system from changing fields
// located in other steps, resetting previous steps and breaking overall UX.
const isCurrentlyActive = ref(props.isActive);

watch(() => [props.isActive], () => {
  isCurrentlyActive.value = props.isActive;
});

const focusField = (focusedValue: UserInput): void => {
  isCurrentlyActive.value = true;
  if (props.field.componentProps.onFocus !== undefined) {
    props.field.componentProps.onFocus(focusedValue);
  }
};

const componentProps = computed(() => ({
  ...props.field.componentProps,
  onFocus: focusField,
}));

const actualField = computed(() => {
  // Unknown field type...
  if (allComponents.value[props.field.component] === undefined) {
    return null;
  }

  // Registered field type...
  return allComponents.value[props.field.component]({
    ...props.field,
    path: props.path,
    i18n: props.i18n,
    label: label.value,
    message: message.value,
    allValues: allValues.value,
    variables: props.variables,
    userInputs: props.userInputs,
    isActive: isCurrentlyActive.value,
    componentProps: componentProps.value,
    customComponents: props.customComponents,
  }, props.onUserAction);
});
</script>

<template>
  <component
    :is="actualField.component"
    v-if="actualField !== null"
    v-bind="actualField.props"
  />
</template>
