/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import PropTypes, { InferProps } from 'prop-types';
import fieldPropType from 'scripts/propTypes/field';

/**
 * Form step propType.
 */
const stepPropTypes = {
  i18n: PropTypes.func,
  index: PropTypes.number,
  isActive: PropTypes.bool,
  onUserAction: PropTypes.func,
  id: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  allValues: PropTypes.any.isRequired,
  customComponents: PropTypes.objectOf(PropTypes.func.isRequired),
  fields: PropTypes.arrayOf(PropTypes.shape(fieldPropType).isRequired).isRequired,

};

export default stepPropTypes;
export type Step = InferProps<typeof stepPropTypes>;
