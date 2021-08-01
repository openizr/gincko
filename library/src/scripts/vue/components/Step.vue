<template>
  <div :class="buildClass('form-step', [status, id, isActive ? 'active': ''])">
    <div class="form-step__fields">
      <!-- Key is composed of both step and field ids, in order to ensure each field is correctly
      reset when user changes his journey in previous steps.  -->
      <Field
        v-for="field in fields"
        :id="field.id"
        :key="field.id"
        :i18n="i18n"
        :active="isActive"
        :type="field.type"
        :label="field.label"
        :value="field.value"
        :status="field.status"
        :options="field.options"
        :message="field.message"
        :custom-components="customComponents"
        @userAction="onUserAction"
      />
    </div>
  </div>
</template>

<script lang="ts">
/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Vue from 'vue';
import { buildClass } from 'sonar-ui/vue';
import Field from 'scripts/vue/components/Field.vue';
import { FormValue, UserAction } from 'scripts/core/Engine';
import { Field as FormField } from 'scripts/propTypes/field';

type Generic = Record<string, FormValue>;

interface Props {
  id: string;
  index: number;
  status: string;
  fields: FormField[];
  isActive: boolean;
  i18n: (label: string, values?: Record<string, string>) => string;
  customComponents: {
    [type: string]: (field: FormField, onUserAction: (newValue: FormValue) => void) => {
      name: string;
      props: FormValue;
      events: FormValue;
    };
  };
}

/**
 * Form step.
 */
export default Vue.extend<Generic, Generic, Generic, Props>({
  components: {
    Field,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    i18n: {
      type: Function,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    fields: {
      type: Array,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    customComponents: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  methods: {
    onUserAction(userAction: UserAction): void {
      this.$emit('userAction', { ...userAction, stepIndex: this.index, stepId: this.id });
    },
    buildClass(baseClass: string, modifiers: string[]) {
      return buildClass(baseClass, modifiers);
    },
  },
});
</script>
