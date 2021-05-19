/**
 * Copyright (c) Matthieu Jabbour. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

declare module 'scripts/types' {
  import { InferProps } from 'prop-types';
  import Engine from 'scripts/core/Engine';
  import stepPropTypes from 'scripts/propTypes/step';
  import fieldPropTypes from 'scripts/propTypes/field';
  import configurationPropTypes from 'scripts/propTypes/configuration';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Json = any;
  export type FormValue = Json;
  export type Plugin = (engine: Engine) => void;
  export type Step = InferProps<typeof stepPropTypes>;
  export type Field = InferProps<typeof fieldPropTypes>;
  export type Configuration = InferProps<typeof configurationPropTypes>;
  export type Hook = (data: Json, next: (data?: Json) => Promise<Json>) => Promise<Json>;
  export type FormEvent = 'loadNextStep' | 'loadedNextStep' | 'userAction' | 'submit' | 'error';
  export type Component = (field: Field, onUserAction: (newValue: Json) => void) => JSX.Element;
  export type Listener = (data: Json, hooksChain: (data?: Json) => Promise<Json>) => Promise<Json>;
  export type Generic = Record<string, Json>;

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
}
