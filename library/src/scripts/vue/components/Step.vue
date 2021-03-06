<template>
  <div :class="buildClass('gincko__step', [status, id, isActive ? 'active': ''])">
    <div class="gincko__step__fields">
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
        :all-values="allValues"
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
import { Step } from 'scripts/propTypes/step';
import Field from 'scripts/vue/components/Field.vue';
import { AnyValue, UserAction } from 'scripts/core/Engine';
import { Field as FieldType } from 'scripts/propTypes/field';

type Generic = Record<string, AnyValue>;

interface Props extends Step {
  i18n: (label: string, values?: Record<string, string>) => string;
  customComponents: {
    [type: string]: (field: FieldType, onUserAction: (newValue: AnyValue) => void) => {
      name: string;
      props: AnyValue;
      events: AnyValue;
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
    allValues: {
      type: Object,
      required: true,
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
