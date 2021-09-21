/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import PropTypes, { InferProps } from 'prop-types';

/**
 * Form field propType.
 */
const fieldPropTypes = {
  value: PropTypes.any,
  i18n: PropTypes.func,
  active: PropTypes.bool,
  label: PropTypes.string,
  message: PropTypes.string,
  allValues: PropTypes.any,
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  options: PropTypes.any.isRequired,
  status: PropTypes.oneOf(['initial', 'error', 'success']).isRequired,
};

export default fieldPropTypes;
export type Field = InferProps<typeof fieldPropTypes>;
