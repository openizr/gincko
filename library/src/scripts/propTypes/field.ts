/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import PropTypes from 'prop-types';

/**
 * Form field propType.
 */
export default {
  active: PropTypes.bool,
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  message: PropTypes.string,
  label: PropTypes.string,
  tooltip: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.bool.isRequired,
    PropTypes.string.isRequired,
    PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  ]),
  status: PropTypes.oneOf(['initial', 'error', 'success']),
  options: PropTypes.any.isRequired,
};
