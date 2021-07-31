<template>
  <ActualForm
    :key="key"
    :i18n="i18n"
    :active-step="activeStep"
    :configuration="configuration"
    :custom-components="customComponents"
  />
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
import {
  Field,
  FormValue,
  Configuration,
} from 'scripts/core/Engine';
import { generateRandomId } from 'sonar-ui/vue';
import ActualForm from 'scripts/vue/containers/ActualForm.vue';

type Generic = Record<string, FormValue>;

interface Props {
  activeStep: string;
  configuration: Configuration;
  i18n: (label: string, values?: Record<string, string>) => string;
  customComponents: {
    [type: string]: (field: Field, onUserAction: (newValue: FormValue) => void) => {
      name: string;
      props: FormValue;
      events: FormValue;
    };
  };
}

/**
 * Dynamic form.
 */
export default Vue.extend<Generic, Generic, Generic, Props>({
  components: { ActualForm },
  props: {
    activeStep: {
      type: String,
      required: false,
      default: null,
    },
    configuration: {
      type: Object,
      required: true,
    },
    customComponents: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    i18n: {
      type: Function,
      required: false,
      default: (label: string, values: Record<string, string> = {}): string => {
        let newLabel = label;
        Object.keys(values).forEach((key) => {
          newLabel = newLabel.replace(new RegExp(`{{${key}}}`, 'g'), values[key]);
        });
        return newLabel;
      },
    },
  },
  data() {
    return {
      key: generateRandomId(),
    };
  },
  watch: {
    configuration() {
      this.key = generateRandomId();
    },
  },
});
</script>
