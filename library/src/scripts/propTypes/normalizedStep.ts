/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import PropTypes from 'prop-types';

/**
 * Normalized form step propType.
 */
export default {
  /** List of step's fields ids. */
  fields: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,

  /** Whether to submit form when step is complete. */
  submit: PropTypes.bool,

  /** Determines which step to load next. */
  nextStep: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.func.isRequired,
  ]),
};
