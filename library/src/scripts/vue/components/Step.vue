<template>
  <div :class="buildClass('form-step', [status, id, isActive ? 'active': ''])">
    <div class="form-step__fields">
      <!-- Key is composed of both step and field ids, in order to ensure each field is correctly
      reset when user changes his journey in previous steps.  -->
      <Field
        v-for="field in fields"
        :id="field.id"
        :key="field.id"
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

import {
  Field as FormField,
  Generic,
  FormValue,
  UserAction,
} from 'scripts/types';
import Vue from 'vue';
import { buildClass } from 'sonar-ui/vue';
import Field from 'scripts/vue/components/Field.vue';

interface Props {
  id: string;
  index: number;
  status: string;
  fields: FormField[];
  isActive: boolean;
  customComponents: {
    [type: string]: (field: FormField, onUserAction: (newValue: FormValue) => void) => {
      name: string;
      props: Json;
      events: Json;
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
    onUserAction(fieldId: string, userAction: UserAction): void {
      this.$emit('userAction', this.index, fieldId, userAction);
    },
    buildClass(baseClass: string, modifiers: string[]) {
      return buildClass(baseClass, modifiers);
    },
  },
});
</script>
