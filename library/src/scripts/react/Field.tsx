/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import builtInComponents from 'scripts/react/Components';

interface FieldProps {
  /** Generated field. */
  field: Field;

  /** Field's path. */
  path: string;

  /** Internationalization function, used for labels translation. */
  i18n: I18n;

  /** Whether field belongs to the active step. */
  isActive: boolean;

  /** Form variables. */
  variables: Variables;

  /** List of user inputs. */
  userInputs: UserInputs;

  /** Callback to trigger at each user action. */
  onUserAction: OnUserAction;

  /** List of form's custom UI components. */
  customComponents: CustomComponents;
}

/**
 * React form field.
 */
function Field(props: FieldProps): JSX.Element {
  const { path, i18n, field } = props;
  const { userInputs, variables } = props;
  const { isActive, customComponents, onUserAction } = props;

  const allComponents = React.useMemo<CustomComponents>(() => ({
    ...builtInComponents,
    ...customComponents,
  }), [customComponents]);

  const allValues = React.useMemo(() => ({ ...variables, ...userInputs }), [variables, userInputs]);

  const label = React.useMemo(() => ((field.label !== undefined)
    ? i18n(field.label, allValues)
    : undefined
  ), [i18n, allValues, field.label]);

  const message = React.useMemo(() => {
    const helper = field.message || field.componentProps.helper;
    return (helper !== undefined) ? i18n(helper, allValues) : undefined;
  }, [i18n, allValues, field.message, field.componentProps.helper]);

  // The following lines prevent browsers auto-fill system from changing fields
  // located in other steps, resetting previous steps and breaking overall UX.
  const [isCurrentlyActive, setIsCurrentlyActive] = React.useState(isActive);

  React.useEffect(() => {
    setIsCurrentlyActive(isActive);
  }, [isActive]);

  const focusField = React.useCallback((focusedValue: UserInput): void => {
    setIsCurrentlyActive(true);
    if (field.componentProps.onFocus !== undefined) {
      field.componentProps.onFocus(focusedValue);
    }
  }, [field.componentProps]);

  const componentProps = React.useMemo(() => ({
    ...field.componentProps, onFocus: focusField,
  }), [focusField, field.componentProps]);

  const actualField = React.useMemo(() => {
    // Unknown field type...
    if (allComponents[field.component] === undefined) {
      return null;
    }

    // Registered field type...
    return allComponents[field.component]({
      ...field,
      message,
      path,
      i18n,
      label,
      variables,
      allValues,
      userInputs,
      componentProps,
      customComponents,
      isActive: isCurrentlyActive,
    }, onUserAction);
  }, [
    i18n,
    path,
    field,
    label,
    message,
    variables,
    allValues,
    userInputs,
    onUserAction,
    allComponents,
    componentProps,
    customComponents,
    isCurrentlyActive,
  ]);

  return actualField as JSX.Element;
}

export default React.memo(Field);
