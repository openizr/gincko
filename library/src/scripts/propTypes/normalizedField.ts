/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import PropTypes from 'prop-types';

/**
 * Normalized form field propType.
 */
export default {
  /** Field's type. */
  type: PropTypes.string.isRequired,

  /** Whether field is required. */
  required: PropTypes.bool,

  /** Field's label. */
  label: PropTypes.string,

  /** Field's status-specific messages. */
  messages: PropTypes.shape({
    /** Message passed to the field when status is "success". */
    success: PropTypes.string,

    /** Message passed to the field when it is empty but required. */
    required: PropTypes.string,

    /** Returns a different message depending on validation rule. */
    validation: PropTypes.func,
  }),

  /** Field's default value. */
  value: PropTypes.any,

  /** Field's options. */
  options: PropTypes.any,

  /** Whether to load next step when performing a user action on this field. */
  loadNextStep: PropTypes.bool,

  /** Create and display this field only if the given condition is met. */
  displayIf: PropTypes.func,
};
