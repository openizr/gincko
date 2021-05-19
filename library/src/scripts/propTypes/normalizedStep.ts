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
  fields: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  submit: PropTypes.bool,
  nextStep: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.func.isRequired,
  ]),
};
