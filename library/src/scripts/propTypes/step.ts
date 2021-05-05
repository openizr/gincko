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
  index: PropTypes.number,
  isActive: PropTypes.bool,
  onUserAction: PropTypes.func,
  id: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  customComponents: PropTypes.objectOf(PropTypes.func.isRequired),
  fields: PropTypes.arrayOf(PropTypes.shape(fieldPropType).isRequired).isRequired,
};
