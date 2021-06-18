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
  type: PropTypes.string.isRequired,
  required: PropTypes.bool,
  label: PropTypes.string,
  messages: PropTypes.shape({
    success: PropTypes.string,
    required: PropTypes.string,
    validation: PropTypes.func,
  }),
  value: PropTypes.any,
  options: PropTypes.any,
  loadNextStep: PropTypes.bool,
};
