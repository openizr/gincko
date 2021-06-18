/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import PropTypes from 'prop-types';
import normalizedStepPropType from 'scripts/propTypes/normalizedStep';
import normalizedFieldPropType from 'scripts/propTypes/normalizedField';

/**
 * Configuration propType.
 */
export default {
  loaderDisplayerOptions: PropTypes.shape({
    enabled: PropTypes.bool,
    timeout: PropTypes.number,
  }),
  reCaptchaHandlerOptions: PropTypes.shape({
    enabled: PropTypes.bool,
    siteKey: PropTypes.string,
  }),
  valuesCheckerOptions: PropTypes.shape({
    onSubmit: PropTypes.bool,
  }),
  valuesLoaderOptions: PropTypes.shape({
    enabled: PropTypes.bool,
    cacheId: PropTypes.string,
    autoSubmit: PropTypes.bool,
    injectValuesTo: PropTypes.arrayOf(PropTypes.string.isRequired),
  }),
  root: PropTypes.string.isRequired,
  plugins: PropTypes.arrayOf(PropTypes.func.isRequired),
  nonInteractiveFields: PropTypes.arrayOf(PropTypes.string.isRequired),
  steps: PropTypes.objectOf(PropTypes.shape(normalizedStepPropType).isRequired).isRequired,
  fields: PropTypes.objectOf(PropTypes.shape(normalizedFieldPropType).isRequired).isRequired,
};
