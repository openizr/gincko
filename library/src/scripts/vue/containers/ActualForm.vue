<template>
  <form
    :id="configuration.id"
    class="gincko"
    @submit="preventSubmit"
  >
    <div class="gincko__steps">
      <!-- Steps. -->
      <Step
        v-for="(step, index) in steps"
        :id="step.id"
        :key="`${index}_${step.id}`"
        :i18n="i18n"
        :index="index"
        :is-active="(activeStep !== null)
          ? activeStep === step.id
          : index === steps.length - 1"
        :fields="step.fields"
        :status="step.status"
        :custom-components="customComponents"
        @userAction="onUserAction"
      />

      <!-- Step loader. -->
      <div
        v-if="loadingNextStep === true"
        class="ui-loader"
      />
    </div>
  </form>
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
import { Field } from 'scripts/propTypes/field';
import Step from 'scripts/vue/components/Step.vue';
import { Configuration } from 'scripts/propTypes/configuration';
import Engine, { AnyValue, UserAction } from 'scripts/core/Engine';

type Generic = Record<string, AnyValue>;

interface Props {
  activeStep: string;
  configuration: Configuration;
  i18n: (label: string, values?: Record<string, string>) => string;
  customComponents: {
    [type: string]: (field: Field, onUserAction: (newValue: AnyValue) => void) => {
      name: string;
      props: AnyValue;
      events: AnyValue;
    };
  };
}

/**
 * Sub-component that will actually render the form.
 */
export default Vue.extend<Generic, Generic, Generic, Props>({
  $store: null,
  $subscription: null,
  components: { Step },
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
      required: true,
    },
    i18n: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      steps: [],
      loadingNextStep: true,
    };
  },
  mounted() {
    const engine = new Engine(this.configuration);
    this.$store = engine.getStore();
    this.$subscription = this.$store.subscribe('steps', (newState: AnyValue) => {
      this.steps = newState.steps;
      this.loadingNextStep = newState.loadingNextStep;
    });
  },
  beforeDestroy(): void {
    this.$store.unsubscribe('steps', this.$subscription);
  },
  methods: {
    preventSubmit(event: Event): void {
      event.preventDefault();
    },
    onUserAction(userAction: UserAction): void {
      (this as AnyValue).$store.mutate('userActions', 'ADD', userAction);
    },
  },
} as AnyValue);
</script>
