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
  validation: PropTypes.func,
  transform: PropTypes.func,
  label: PropTypes.string,
  tooltip: PropTypes.string,
  messages: PropTypes.shape({
    success: PropTypes.string,
    required: PropTypes.string,
    validation: PropTypes.string,
  }),
  value: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  ]),
  options: PropTypes.any,
};
