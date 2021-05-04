/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import PropTypes from 'prop-types';
import fieldPropType from 'scripts/propTypes/field';

/**
 * Form step propType.
 */
export default {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onUserAction: PropTypes.func.isRequired,
  customComponents: PropTypes.objectOf(PropTypes.func.isRequired).isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape(fieldPropType).isRequired).isRequired,
};
