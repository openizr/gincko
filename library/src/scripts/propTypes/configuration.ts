/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import PropTypes, { InferProps } from 'prop-types';
import normalizedStepPropType from 'scripts/propTypes/normalizedStep';
import normalizedFieldPropType from 'scripts/propTypes/normalizedField';

/**
 * Configuration propType.
 */
const configurationPropTypes = {
  /** Form id, used to name cache key. */
  id: PropTypes.string,

  /** Whether to enable cache. */
  cache: PropTypes.bool,

  /** Whether to enable fields autofill with existing values. */
  autoFill: PropTypes.bool,

  /** Whether to restart form from the beginning on page reload. */
  restartOnReload: PropTypes.bool,

  /** Whether to clear cache on form submit. */
  clearCacheOnSubmit: PropTypes.bool,

  /** Root step, from which to start the form. */
  root: PropTypes.string.isRequired,

  /** Whether to check fields values only on step submit. */
  checkValuesOnSubmit: PropTypes.bool,

  /** Custom plugins registrations. */
  plugins: PropTypes.arrayOf(PropTypes.func.isRequired),

  /** List of fields types in which to inject form values in options. */
  injectValuesTo: PropTypes.arrayOf(PropTypes.string.isRequired),

  /** List of non-interactive fields types (message, ...) that will always pass to success state. */
  nonInteractiveFields: PropTypes.arrayOf(PropTypes.string.isRequired),

  /** List of form steps. */
  steps: PropTypes.objectOf(PropTypes.shape(normalizedStepPropType).isRequired).isRequired,

  /** List of form fields. */
  fields: PropTypes.objectOf(PropTypes.shape(normalizedFieldPropType).isRequired).isRequired,
};

export default configurationPropTypes;
export type Configuration = InferProps<typeof configurationPropTypes>;
