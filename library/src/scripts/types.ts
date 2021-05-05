/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { InferProps } from 'prop-types';
import Engine from 'scripts/core/Engine';
import stepPropTypes from 'scripts/propTypes/step';
import fieldPropTypes from 'scripts/propTypes/field';
import configurationPropTypes from 'scripts/propTypes/configuration';

export type FormValue = Json;
export type Plugin = (engine: Engine) => void;
export type Step = InferProps<typeof stepPropTypes>;
export type Field = InferProps<typeof fieldPropTypes>;
export type Configuration = InferProps<typeof configurationPropTypes>;
export type Hook = (data: Json, next: (data?: Json) => Promise<Json>) => Promise<Json>;
export type FormEvent = 'loadNextStep' | 'loadedNextStep' | 'userAction' | 'submit' | 'error';
export type Component = (field: Field, onUserAction: (newValue: string) => void) => JSX.Element;
export type Listener = (data: Json, middlewaresChain: (data?: Json) => Promise<Json>) =>
  Promise<Json>;

export interface UserAction {
  fieldId: string;
  stepIndex: number;
  type: 'input' | 'click';
  value: FormValue;
}

export type Components = {
  [type: string]: Component;
};

export interface UserActionsState {
  actionsPerStep: UserAction[][];
  lastUserAction: UserAction | null;
}

export interface FormValues {
  [fieldId: string]: FormValue;
}
