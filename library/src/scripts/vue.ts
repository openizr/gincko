/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* istanbul ignore file */

declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

declare module 'scripts/vue' {
  import Form from 'scripts/vue/containers/Form.vue';

  export default Form;
}
