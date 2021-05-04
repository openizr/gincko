/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { InferProps } from 'prop-types';
import Engine from 'scripts/core/Engine';
import configuration from 'scripts/propTypes/configuration';

export type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type FormValue = string | string[];// TODO fileReader

export interface UserAction {
  fieldId: string;
  stepIndex: number;
  type: 'input' | 'click';
  value: FormValue;
}

export type Listener = (data: Json, middlewaresChain: (data?: Json) => Promise<Json>) =>
  Promise<Json>;

export interface FormField {
  id: string;
  type: string;
  options: Json;
  active?: boolean | null;
  label?: string | null;
  tooltip?: string | null;
  message?: string | null;
  value?: string | string[] | null;
  status: 'initial' | 'error' | 'success';
}
export type FormEvent = 'loadNextStep' | 'loadedNextStep' | 'userAction' | 'submit' | 'error';
export type Hook = (data: Json, next: (data?: Json) => Promise<Json>) => Promise<Json>;

export interface Step {
  id: string;
  fields: FormField[];
  status: string;
}

export type Configuration = InferProps<typeof configuration>;

export type Components = {
  [type: string]: Component;
};

export type Component = (field: FormField, onUserAction: (newValue: string) => void) => JSX.Element;

export interface UserActionsState {
  actionsPerStep: UserAction[][];
  lastUserAction: UserAction | null;
}

export type Plugin = (engine: Engine) => void;

export interface FormValues {
  [fieldId: string]: FormValue;
}
