/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable class-methods-use-this */

import Store from 'diox';
import state from 'scripts/core/state';
import { Cache } from 'scripts/index.d';
import deepFreeze from 'scripts/core/deepFreeze';
import userActions from 'scripts/core/userActions';
import { isPlainObject, deepMerge, deepCopy } from 'basx';

/**
 * Form engine.
 */
export default class BaseEngine {
  /** Diox store instance. */
  protected store: Store;

  /** Cache client. */
  protected cache: Cache | null;

  /** Form cache key. */
  protected cacheKey: string;

  /** Timeout after which to refresh cache. */
  protected cacheTimeout: NodeJS.Timeout | null;

  /** Form engine configuration. */
  protected configuration: Configuration;

  /** Contains all events hooks to trigger when events are fired. */
  protected hooks: { [eventName: string]: Hook<HookData>[] };

  /** Whether next step is being loaded. */
  protected isLoading: boolean;

  /** Contains the actual form steps, as they are currently rendered to end-user. */
  protected steps: Step[];

  /** Contains all user inputs (whether related fields are rendered or not). */
  protected userInputs: UserInputs;

  /** Contains user-defined variables, accessible anywhere, anytime in the form. */
  protected variables: Variables;

  /** A reference to the current step, for faster access. */
  protected currentStep: Step | null;

  /** Mutations queuing timeout. */
  protected mutationTimeout: NodeJS.Timeout | null;

  /**
   * Checks whether `input` is considered as empty, according to its type.
   *
   * @param {UserInput} input Input to check.
   *
   * @param {string} type Input's type.
   *
   * @returns {boolean} `true` if `input` is empty, `false` otherwise.
   */
  protected isEmpty(input: UserInput, type: string): boolean {
    return (
      input === null
      || input === undefined
      || (type === 'string' && `${input}`.trim() === '')
      || (type === 'array' && (<unknown[]>input).length === 0)
      || ((type === 'object') && Object.keys(<UserInputs>input).length === 0)
      || ((type === 'dynamicObject') && Object.keys(<UserInputs>input).length === 0)
    );
  }

  /**
   * Checks whether `firstInput` and `secondInput` are equal, according to their type.
   *
   * @param {UserInput} firstInput First input to compare.
   *
   * @param {UserInput} secondInput Second input to compare.
   *
   * @param {string} type Inputs' type.
   *
   * @returns {boolean} `true` if `firstInput` and `secondInput` are equal, `false` otherwise.
   */
  protected areEqual(firstInput: UserInput, secondInput: UserInput, type: string): boolean {
    return (
      firstInput === secondInput
      || (type === 'float' && Number.isNaN(secondInput) && Number.isNaN(firstInput))
      || (type === 'integer' && Number.isNaN(secondInput) && Number.isNaN(firstInput))
      || (type === 'date' && (<Date>firstInput)?.getTime() === (<Date>secondInput).getTime())
      || (type === 'binary' && (
        (<File>firstInput).name === (<File>secondInput).name
        && (<File>firstInput).size === (<File>secondInput).size
      ))
    );
  }

  /**
   * Adds the given mutation and related data into the queue. "Buffering" mutations is an
   * optimization that prevents UI from being notified (and thus re-rendered) too many times per
   * second, which would be unecessary and not great UX-wise.
   *
   * @param {string} mutation Mutation name for the `state` module.
   *
   * @param {StateState | boolean} data Mutation data.
   *
   * @returns {void}
   */
  protected enqueueMutation(mutation: string, data: Step[] | boolean): void {
    clearTimeout(<NodeJS.Timeout>(this.mutationTimeout));
    if (mutation === 'SET_LOADER') {
      this.isLoading = <boolean>data;
    }
    this.mutationTimeout = setTimeout(() => {
      this.store.mutate('state', 'UPDATE', {
        steps: this.steps,
        loading: this.isLoading,
        variables: this.variables,
        userInputs: this.userInputs,
      });
    }, 50);
  }

  /**
   * Returns the first dynamic object's pattern that matches `fieldId`.
   *
   * @param {string} fieldId Field's id to match against patterns.
   *
   * @param {NestedFieldConfiguration} configuration Dynamic object's configuration.
   *
   * @returns {string} First matching pattern, if it exists, `null` otherwise.
   */
  protected getPattern(fieldId: string, configuration: NestedFieldConfiguration): string | null {
    const patterns = Object.keys(configuration.fields);
    for (let index = 0, { length } = patterns; index < length; index += 1) {
      if (new RegExp(patterns[index]).test(fieldId)) {
        return patterns[index];
      }
    }
    return null;
  }

  /**
   * Removes any functions from generated steps. Most of the time, JS functions cannot be stored in
   * cache, which is why we need to mangle them before caching form steps, and to add them back when
   * fetching form steps from cache.
   *
   * @param {Step[]} steps Steps to mangle functions from.
   *
   * @returns {Step[]} Steps without functions.
   */
  protected withoutFunctions(steps: Step[]): Step[] {
    const mangledData = Array.isArray(steps) ? [] : {};
    Object.keys(steps).forEach((key) => {
      const index = key as unknown as number;
      if (typeof steps[index] !== 'function') {
        if (isPlainObject(steps[index]) || Array.isArray(steps[index])) {
          (<UserInputs>mangledData)[key] = this.withoutFunctions(steps[index] as unknown as Step[]);
        } else {
          (<UserInputs>mangledData)[key] = steps[index];
        }
      }
    });
    return <Step[]>mangledData;
  }

  /**
   * Merges configuration and generated fields' `componentProps`. Most of the time, JS functions
   * cannot be stored in cache, which is why we need to mangle them before caching form steps, and
   * to add them back when fetching form steps from cache.
   *
   * @param {Fields} fields Form fields to add functions to.
   *
   * @param {FieldConfigurations} fieldConfigurations Configuration to retrieve functions from.
   *
   * @returns {Fields} Fields with functions.
   */
  protected withFunctions(fields: Fields, fieldConfigurations: FieldConfigurations): Fields {
    return fields.map((field) => {
      const fieldConfiguration = fieldConfigurations[field?.id || ''];
      if (field === null || fieldConfiguration === undefined) {
        return null;
      }
      const fieldWithFunctions: Field = {
        ...field,
        componentProps: deepMerge(fieldConfiguration.componentProps, field.componentProps),
      };
      const { fields: subFields } = field;
      if (subFields !== undefined) {
        if (fieldConfiguration.type === 'array') {
          fieldWithFunctions.fields = subFields.map((subField, index) => {
            const subFieldConfigurations = { [index]: fieldConfiguration.fields };
            return this.withFunctions([subField], subFieldConfigurations)[0];
          });
        } else if (fieldConfiguration.type === 'dynamicObject') {
          fieldWithFunctions.fields = subFields.map((subField) => {
            const subFieldId = subField?.id || '';
            const pattern = this.getPattern(subFieldId, fieldConfiguration) || '';
            const subFieldConfigurations = { [subFieldId]: fieldConfiguration.fields[pattern] };
            return this.withFunctions([subField], subFieldConfigurations)[0];
          });
        } else if (fieldConfiguration.type === 'object') {
          fieldWithFunctions.fields = this.withFunctions(subFields, fieldConfiguration.fields);
        }
      }
      return fieldWithFunctions;
    });
  }

  /**
   * Filters user inputs, keeping only the ones for rendered fields.
   *
   * @param {boolean} partial Whether to keep only updated inputs, or all inputs.
   *
   * @param {Field | null} field Current field to get input from.
   *
   * @param {FieldConfiguration} fieldConfiguration Current field's configuration.
   *
   * @param {UserInput} currentInitialInput Current initial input.
   *
   * @param {UserInput} filteredInputs Current filtered input.
   *
   * @returns {void}
   */
  protected filterInputs(
    partial: boolean,
    field: Field | null,
    fieldConfiguration: FieldConfiguration,
    currentInitialInput: UserInput,
    filteredInputs: UserInput,
  ): void {
    if (field !== null) {
      const { type } = fieldConfiguration;
      const currentFilteredInputs = filteredInputs;

      if (type === 'array') {
        const filteredArray: UserInput[] = [];
        (<Fields>field.fields).forEach((subField, index) => {
          this.filterInputs(
            partial,
            subField,
            fieldConfiguration.fields,
            (<UserInputs>currentInitialInput)?.[index],
            filteredArray,
          );
        });
        if (filteredArray.length > 0) {
          (<UserInputs>currentFilteredInputs)[field.id] = filteredArray;
        }
      } else if (type === 'object' || type === 'dynamicObject') {
        const filteredObject: UserInputs = {};
        (<Fields>field.fields).forEach((subField, index) => {
          const key = (type === 'object')
            ? subField?.id
            : this.getPattern(`${subField?.id}`, fieldConfiguration);
          this.filterInputs(
            partial,
            subField,
            fieldConfiguration.fields[`${key}`],
            (<UserInputs>currentInitialInput)?.[index],
            filteredObject,
          );
        });
        if (Object.keys(filteredObject).length > 0) {
          (<UserInputs>currentFilteredInputs)[field.id] = filteredObject;
        }
      } else if (!this.areEqual(field.value, currentInitialInput, type) || !partial) {
        (<UserInputs>currentFilteredInputs)[field.id] = field.value;
      }
    }
  }

  /**
   * Generates field with path `path` from its configuration `fieldConfiguration`.
   *
   * @param {string} path Field path.
   *
   * @param {FieldConfiguration} fieldConfiguration Field configuration.
   *
   * @returns {Field} Generated field.
   */
  protected createField(path: string, fieldConfiguration: FieldConfiguration): Field {
    const newField: Field = ({
      value: null,
      status: 'initial',
      label: fieldConfiguration.label,
      id: path.split('.').slice(-1)[0],
      component: fieldConfiguration.component,
      componentProps: fieldConfiguration.componentProps || {},
    });

    if (fieldConfiguration.type === 'array' || fieldConfiguration.type === 'dynamicObject') {
      newField.fields = [];
      newField.fieldIds = [];
    } else if (fieldConfiguration.type === 'object') {
      const fieldIds = Object.keys(fieldConfiguration.fields);
      newField.fields = new Array(fieldIds.length).fill(null);
      newField.fieldIds = fieldIds;
    }
    if ((<GenericFieldConfiguration>fieldConfiguration).submit !== true) {
      // Triggering a new user action with either last user input, or field's default value...
      const currentInputs = this.getInputs(path, false);
      const { defaultValue, type } = <GenericFieldConfiguration>fieldConfiguration;
      if (this.configuration.autoFill !== false && currentInputs !== null) {
        this.userAction({ path, data: currentInputs, type: 'input' });
      } else if (!this.isEmpty(defaultValue, type)) {
        this.userAction({ path, data: defaultValue, type: 'input' });
      }
    }

    return newField;
  }

  /**
   * Coerces user inputs into proper types and performs some type checks on user actions.
   *
   * @param {UserInput} userInput User input to coerce and check.
   *
   * @param {string} type Type to use for coercion and checking.
   *
   * @returns {Promise<UserInput>} Coerced user input.
   */
  protected async coerceAndCheckInput(userInput: UserInput, type: string): Promise<UserInput> {
    // Coercing data types...
    const isEmpty = (typeof userInput === 'string' && userInput.trim() === '');
    if (type === 'boolean') {
      return (`${userInput}` === 'true');
    }
    if (type === 'float' && typeof userInput !== 'number') {
      const parsedData = parseFloat(<string>userInput);
      return (isEmpty || Number.isNaN(parsedData)) ? null : parsedData;
    }
    if (type === 'integer' && typeof userInput !== 'number') {
      const parsedData = parseInt(<string>userInput, 10);
      return (isEmpty || Number.isNaN(parsedData)) ? null : parsedData;
    }
    if (type === 'date' && !(userInput instanceof Date)) {
      return new Date(<string>userInput);
    }

    // Checking types...
    if (type === 'array' && userInput !== null && !Array.isArray(userInput)) {
      await this.triggerHooks('error', new Error('Invalid input type for array.'));
    } else if (type === 'object' && userInput !== null && !isPlainObject(userInput)) {
      await this.triggerHooks('error', new Error('Invalid input type for object.'));
    } else if (type === 'dynamicObject' && userInput !== null && !isPlainObject(userInput)) {
      await this.triggerHooks('error', new Error('Invalid input type for dynamicObject.'));
    }

    return userInput;
  }

  /**
   * Performs a deep comparison between `newValue` and `field`'s value and returns a list of user
   * actions that must be triggered to reflect subsequent changes.
   *
   * @param {Field | null} field Field to compate `newValue` with.
   *
   * @param {UserInput} newValue New value to compare.
   *
   * @param {FieldConfiguration} fieldConfiguration Field's configuration.
   *
   * @param {string} path Current field's path.
   *
   * @param {boolean} [isRoot = true] Whether current field is the root field (used internally).
   *
   * @returns {UserAction[]} List of user actions that must be triggered.
   */
  protected deepCompare(
    field: Field | null,
    newValue: UserInput,
    fieldConfiguration: FieldConfiguration,
    path: string,
    isRoot = true,
  ): UserAction[] {
    // If field is `null`, its creation will trigger a user action anyway.
    if (field === null) {
      return [];
    }

    const { type } = fieldConfiguration;
    if (type === 'object' || type === 'dynamicObject' || type === 'array') {
      const newFields: Fields = [];
      const newFieldIds: string[] = [];
      const newUserActions: UserAction[] = [];
      const subFields = <Fields>(field.fields);
      const { fields } = <NestedFieldConfiguration>fieldConfiguration;
      const fieldIds = (type === 'object') ? Object.keys(fields) : Object.keys(<UserInputs>newValue || {});
      for (let index = 0, { length } = fieldIds; index < length; index += 1) {
        const fieldId = fieldIds[index];
        const subField = subFields[index] || null;
        newFields.push(subField);
        newFieldIds.push(fieldId);
        const key = (type === 'dynamicObject') ? this.getPattern(fieldId, fieldConfiguration) : fieldId;
        const fieldValue = (<UserInputs>newValue)[fieldId];
        if (key !== null && fieldValue !== null) {
          newUserActions.push(...this.deepCompare(
            subField,
            (fieldValue !== undefined) ? fieldValue : null,
            (type === 'array') ? <FieldConfiguration>fields : (<FieldConfigurations>fields)[key],
            `${path}.${fieldId}`,
            false,
          ));
        }
      }
      Object.assign(field, { fieldIds: newFieldIds, fields: newFields });
      return newUserActions;
    }

    const { value } = field;
    return isRoot || this.areEqual(value, newValue, type) ? [] : [{ type: 'input', path, data: newValue }];
  }

  /**
   * Toggles field at `path`, according to its rendering condition.
   *
   * @param {string} path Field's path.
   *
   * @param {Fields} parent Field's parent.
   *
   * @param {number} fieldIndex Field's index in its parent's fields list.
   *
   * @param {FieldConfiguration} configuration Field's configuration.
   *
   * @param {UserInput} currentValues Current inputs to update field's value with.
   *
   * @returns {void}
   */
  protected toggleField(
    path: string,
    parent: Fields,
    fieldIndex: number,
    configuration: FieldConfiguration,
    currentValues: UserInput,
  ): void {
    const parentField = parent;
    const { renderCondition, type } = configuration;
    if (renderCondition !== undefined && !renderCondition(this.userInputs, this.variables)) {
      parentField[fieldIndex] = null;
    } else {
      parentField[fieldIndex] = parentField[fieldIndex] || this.createField(path, configuration);
      (<Field>parentField[fieldIndex]).value = (currentValues !== undefined) ? currentValues : null;
      const { fields, fieldIds } = <Field>parentField[fieldIndex];
      if (fields !== undefined && fieldIds !== undefined) {
        for (let index = 0, { length } = fields; index < length; index += 1) {
          if (type === 'array') {
            const fieldPath = `${path}.${index}`;
            const fieldValue = (<UserInput[]>currentValues)?.[index];
            this.toggleField(fieldPath, fields, index, configuration.fields, fieldValue);
          } else if (type === 'object') {
            const fieldId = fieldIds[index];
            const fieldPath = `${path}.${fieldId}`;
            const fieldValue = (<UserInputs>currentValues)?.[fieldId];
            this.toggleField(fieldPath, fields, index, configuration.fields[fieldId], fieldValue);
          } else if (type === 'dynamicObject') {
            const fieldId = fieldIds[index];
            const pattern = this.getPattern(<string>fieldIds[index], configuration);
            if (pattern !== null) {
              const fieldPath = `${path}.${fieldIds[index]}`;
              const fieldValue = (<UserInputs>currentValues)?.[fieldId];
              this.toggleField(fieldPath, fields, index, configuration.fields[pattern], fieldValue);
            }
          }
        }
      }
    }
  }

  /**
   * Validates `field`, making sure that its value passes all validation rules.
   *
   * @param {Field | null} field Field to validate.
   *
   * @param {FieldConfiguration} configuration Field configuration.
   *
   * @param {boolean} partial Whether to also validate empty fields.
   *
   * @returns {string} Field's state ("progress", "success" or "error").
   */
  protected validateField(
    field: Field | null,
    configuration: FieldConfiguration,
    partial: boolean,
  ): string {
    const { type } = configuration;

    if (type === 'null' || field === null) {
      return 'success';
    }

    // Note: this variable is used to determine the step's global status, and has nothing to do with
    // the field's status itself!
    let fieldState = 'progress';
    const currentField = field;
    delete currentField.message;
    const isRequired = configuration.required === true;
    const isEmpty = this.isEmpty(field.value, type);

    // Empty fields...
    if (isEmpty && isRequired && (!partial || currentField.status === 'error')) {
      currentField.message = configuration.messages?.required;
      currentField.status = 'error';
      return 'error';
    }
    if (isEmpty) {
      currentField.status = 'initial';
      return isRequired ? 'progress' : 'success';
    }

    // Validation rules...
    const validation = configuration.messages?.validation;
    const validationMessage = (validation !== undefined)
      ? validation(field.value as unknown as never, this.userInputs, this.variables)
      : null;

    if (validationMessage !== null) {
      fieldState = 'error';
      currentField.message = validationMessage;
    } else {
      fieldState = 'success';
      currentField.status = 'success';
      currentField.message = configuration.messages?.success;
    }

    // Nested fields...
    const { fields, fieldIds } = field;
    if (fields !== undefined && fieldIds !== undefined) {
      for (let index = 0, { length } = fields; index < length; index += 1) {
        let subFieldState = 'error';
        if (type === 'array') {
          subFieldState = this.validateField(fields[index], configuration.fields, partial);
        } else if (type === 'object') {
          const fieldConfiguration = configuration.fields[fieldIds[index]];
          subFieldState = this.validateField(fields[index], fieldConfiguration, partial);
        } else if (type === 'dynamicObject') {
          const pattern = this.getPattern(<string>fieldIds[index], configuration);
          if (pattern !== null) {
            const fieldConfiguration = configuration.fields[pattern];
            subFieldState = this.validateField(fields[index], fieldConfiguration, partial);
          }
        }
        if (subFieldState === 'error' || subFieldState === 'progress') {
          fieldState = subFieldState;
        }
      }
    }
    if (fieldState === 'error') {
      currentField.status = 'error';
    }
    return fieldState;
  }

  /**
   * Toggles all fields and sub-fields for `step`, according to their rendering conditions.
   *
   * @param {Step | null} step Step to toggle fields for.
   *
   * @returns {void}
   */
  protected toggleFields(step: Step | null): void {
    if (step !== null) {
      const { id, fields } = step;
      const stepConfiguration = this.configuration.steps[id];
      const fieldConfigurations = Object.entries(stepConfiguration.fields);
      for (let index = 0, { length } = fieldConfigurations; index < length; index += 1) {
        const fieldId = fieldConfigurations[index][0];
        const fieldConfiguration = fieldConfigurations[index][1];
        this.toggleField(`${id}.${step.index}.${fieldId}`, fields, index, fieldConfiguration, this.userInputs[fieldId]);
      }
    }
  }

  /**
   * Validates current step, making sure that all its fields' values pass validation rules.
   *
   * @param {boolean} [partial = false] Whether to also validate empty fields.
   *
   * @returns {void}
   */
  protected validateFields(partial = false): void {
    if (this.currentStep !== null) {
      let allFieldsSucceeded = true;
      // We reset current step status to not stay in error state forever.
      this.currentStep.status = 'progress';
      const currentStepId = this.currentStep.id;
      const fieldConfigurations = Object.values(this.configuration.steps[currentStepId].fields);
      for (let index = 0, { length } = fieldConfigurations; index < length; index += 1) {
        const field = this.currentStep.fields[index];
        const fieldState = this.validateField(field, fieldConfigurations[index], partial);
        if (fieldState !== 'success') {
          allFieldsSucceeded = false;
          this.currentStep.status = (fieldState === 'progress') ? this.currentStep.status : 'error';
        }
      }
      this.currentStep.status = allFieldsSucceeded ? 'success' : this.currentStep.status;
    }
  }

  /**
   * Returns the list of gincko field/step's configurations for each part of `path`. If no path is
   * provided, a list containing only the global form configuration is returned instead.
   *
   * @param {string} [path] Field/step's path to get configurations for.
   *
   * @returns {SubConfiguration[]} Array of gincko configurations for each part of `path`.
   */
  protected getConfigurations(path?: string): SubConfiguration[] {
    let subConfiguration = <SubConfiguration | undefined>(this.configuration);
    const configurations: SubConfiguration[] = [<Configuration>subConfiguration];
    if (path === undefined) {
      return configurations;
    }
    const splitted = path.split('.');
    subConfiguration = this.configuration.steps[splitted[0]];
    configurations.push(deepFreeze(subConfiguration) || null);
    for (let index = 2, { length } = splitted; index < length; index += 1) {
      const subPath = splitted[index];
      const currentSubConfiguration = <FieldConfiguration | undefined>subConfiguration;
      if (currentSubConfiguration !== undefined) {
        if (currentSubConfiguration.type === 'array') {
          subConfiguration = currentSubConfiguration.fields;
        } else if (currentSubConfiguration.type === 'dynamicObject') {
          const pattern = this.getPattern(subPath, currentSubConfiguration) || '';
          subConfiguration = currentSubConfiguration.fields[pattern];
        } else if (currentSubConfiguration.type === 'object') {
          subConfiguration = currentSubConfiguration.fields[subPath];
        } else {
          subConfiguration = (<StepConfiguration>currentSubConfiguration).fields[subPath];
        }
      }
      configurations.push(deepFreeze(subConfiguration) || null);
    }
    return configurations;
  }

  /**
   * Inserts or updates `userInput` at `path` in the inputs store.
   *
   * @param {string} path Path to insert/update user input at in the inputs store.
   *
   * @param {UserInput} userInput User input to store. If `undefined`, existing value at `path` will
   * be deleted instead of updated.
   *
   * @returns {void}
   */
  protected setInput(path: string, userInput: UserInput): void {
    const splitted = path.split('.');
    let currentInputs = <UserInputs>(this.userInputs);
    const configurations = this.getConfigurations(path);

    // Stop looking up as soon as possible.
    if (configurations.slice(-1)[0] !== null) {
      // We don't care about step's id & index.
      for (let index = 2, { length } = splitted; index < length; index += 1) {
        const subPath = splitted[index];
        const fieldConfiguration = <FieldConfiguration>configurations[index];
        if (index === length - 1) {
          currentInputs[subPath] = userInput;
        } else if (fieldConfiguration.type === 'array') {
          currentInputs[subPath] = currentInputs[subPath] || [];
        } else {
          currentInputs[subPath] = currentInputs[subPath] || {};
        }
        if (fieldConfiguration.type !== 'null') {
          currentInputs = <UserInputs>currentInputs[subPath];
        }
      }
      this.updateCache();
    }
  }

  /**
   * Triggers hooks chain for the given event.
   *
   * @param {FormEvent} eventName Event's name.
   *
   * @param {HookData} data Additional data to pass to the hooks chain.
   *
   * @returns {Promise<HookData>} Pending hooks chain.
   */
  protected async triggerHooks<T extends HookData>(eventName: FormEvent, data: T): Promise<T> {
    try {
      const hooksChain = (this.hooks[eventName] || []).reduce((chain, hook) => (updatedData) => (
        hook(updatedData, chain as NextHook<HookData>)
      ), (updatedData) => Promise.resolve(updatedData));
      const updatedData = await (hooksChain as NextHook<HookData>)(data);
      if (updatedData === undefined) {
        throw new Error(
          `Event "${eventName}": data passed to the next hook is "undefined".`
          + ' This usually means that you did not correctly resolved your hook\'s Promise with'
          + ' proper data.',
        );
      }
      this.forceUpdate();
      return <T>updatedData;
    } catch (error) {
      // Disabling cache on error prevents the form to be stucked in error step forever.
      this.cache = null;
      await this.clearCache();
      // This safety mechanism prevents infinite loops when throwing errors from "error" hooks.
      if (eventName !== 'error' && this.hooks.error !== undefined) {
        await this.triggerHooks('error', <Error>error);
      } else {
        throw error;
      }
      return <T>null;
    }
  }

  /**
   * Updates form's cached data.
   *
   * @returns {void}
   */
  protected updateCache(): void {
    clearTimeout(this.cacheTimeout as NodeJS.Timeout);
    this.cacheTimeout = setTimeout(() => {
      if (this.cache !== null) {
        this.cache.set(this.cacheKey, {
          steps: this.withoutFunctions(this.steps),
          variables: this.variables,
          userInputs: this.userInputs,
        });
      }
    }, 250);
  }

  /**
   * Updates list of generated steps.
   *
   * @param {number} stepIndex Index of the step to create or update.
   *
   * @param {Step} step Created or updated step.
   *
   * @returns {Promise<void>}
   */
  protected async updateSteps(stepIndex: number, step: Step): Promise<void> {
    // We always remove further steps as logic may have changed depending on last user inputs.
    const newSteps = this.steps.slice(0, stepIndex).concat([step]);
    this.enqueueMutation('UPDATE', newSteps);

    // We trigger related hooks if we just loaded a new step.
    const loadedNewStep = (this.steps.length < newSteps.length);
    this.steps = newSteps;
    this.currentStep = newSteps[newSteps.length - 1];
    await (loadedNewStep ? this.triggerHooks('afterStep', step) : Promise.resolve());
  }

  /**
   * Handles form submission and next step generation.
   *
   * @returns {Promise<void>}
   */
  protected async handleSubmit(): Promise<void> {
    const configuration = this.configuration.steps[(<Step>(this.currentStep)).id];
    const { nextStep, submit } = configuration;
    const { submitPartialUpdates: partial, initialValues } = this.configuration;
    if (submit === true) {
      const finalInputs: UserInputs = {};
      for (let stepIndex = 0, { length } = this.steps; stepIndex < length; stepIndex += 1) {
        const { length: fieldsLength } = this.steps[stepIndex].fields;
        const stepConfiguration = this.configuration.steps[this.steps[stepIndex].id];
        for (let fieldIndex = 0; fieldIndex < fieldsLength; fieldIndex += 1) {
          const field = this.steps[stepIndex].fields[fieldIndex];
          this.filterInputs(
            partial !== false,
            field,
            stepConfiguration.fields[`${field?.id}`],
            initialValues,
            finalInputs,
          );
        }
      }
      await this.triggerHooks('submit', this.userInputs);
      if (this.configuration.clearCacheOnSubmit !== false) {
        this.cache = null;
        this.clearCache();
      }
    }

    // Generating next step, if it exists...
    const isFunction = typeof nextStep === 'function';
    this.createStep(isFunction ? nextStep(this.userInputs, this.variables) : nextStep);
  }

  /**
   * Handles new user actions, applying core logic such as hooks triggering or next step generation.
   *
   * @param {UserAction | null} userAction New state sent by `userActions` store module.
   *
   * @returns {Promise<void>}
   */
  protected async handleUserAction(userAction: UserAction | null): Promise<void> {
    if (userAction !== null && this.currentStep !== null) {
      const { path } = userAction;
      clearTimeout(<NodeJS.Timeout>(this.mutationTimeout));

      // If user changes a field in a previous step, it may have an impact on next steps to render.
      // Thus, it is not necessary to keep any more step than the one containing last user action.
      this.steps = this.steps.slice(0, +path.split('.')[1] + 1);

      let shouldSubmit = false;
      const field = this.getField(path);
      const fieldConfiguration = <FieldConfiguration>(this.getConfiguration(path));

      // We process current and all subsequent user actions in batch to optimize performance by
      // calling `toggleFields` and `validateFields` only once, and to enforce hooks consistency.
      const subUserActions = this.deepCompare(field, userAction.data, fieldConfiguration, path);
      const allUserActions = [userAction].concat(subUserActions);
      [userAction].concat();
      const updatedUserActions = await Promise.all(allUserActions.map(async (action) => {
        const updatedUserAction = await this.triggerHooks('userAction', action);
        if (updatedUserAction !== null) {
          const { type, data, path: subPath } = updatedUserAction;
          const subFieldConfiguration = (this.getConfiguration(subPath));
          if (type === 'input' && subFieldConfiguration !== null) {
            const { submit, type: fieldType } = <GenericFieldConfiguration>subFieldConfiguration;
            updatedUserAction.data = await this.coerceAndCheckInput(data, fieldType);
            shouldSubmit = submit === true || shouldSubmit;
          }
        }
        return updatedUserAction;
      }));

      // Storing all fields values in a central registry ensures that they are always up to date
      // (especially when updating an object sub-field for instance).
      this.setInput(path, updatedUserActions[0].data);
      this.toggleFields(this.currentStep);
      this.validateFields(!shouldSubmit);
      await Promise.all(updatedUserActions.map((action) => this.triggerHooks('afterUserAction', action)));
      if (this.currentStep.status === 'success' && shouldSubmit) {
        await this.handleSubmit();
      }
    }
  }

  /**
   * Class constructor.
   *
   * @param {Configuration} configuration Form engine configuration.
   *
   * @returns {void}
   */
  constructor(configuration: Configuration) {
    const store = new Store();
    store.register('state', state);
    store.register('userActions', userActions);
    this.hooks = {};
    this.steps = [];
    this.store = store;
    this.isLoading = true;
    this.currentStep = null;
    this.cacheTimeout = null;
    this.mutationTimeout = null;
    this.configuration = configuration;
    this.cache = configuration.cache || null;
    this.cacheKey = `gincko_${configuration.id || 'cache'}`;
    this.variables = deepCopy(configuration.variables || {});
    this.userInputs = deepCopy(configuration.initialValues || {});

    // Be careful: plugins' order matters!
    (configuration.plugins || []).forEach((hook) => {
      hook({
        on: this.on.bind(this),
        getSteps: this.getSteps.bind(this),
        getStore: this.getStore.bind(this),
        getField: this.getField.bind(this),
        createStep: this.createStep.bind(this),
        userAction: this.userAction.bind(this),
        clearCache: this.clearCache.bind(this),
        forceUpdate: this.forceUpdate.bind(this),
        getVariables: this.getVariables.bind(this),
        setVariables: this.setVariables.bind(this),
        toggleLoader: this.toggleLoader.bind(this),
        getCurrentStep: this.getCurrentStep.bind(this),
        getConfiguration: this.getConfiguration.bind(this),
        getInputs: ((path?: string) => this.getInputs(path)),
      } as unknown as Engine);
    });

    // Engine initialization.
    // NOTE: we must NOT subscribe to `states` module, as it would generate asynchronous updates
    // on the engine's `steps` attribute, which would lead to unpredictable behaviours.
    // `steps` MUST stay the single source of truth, and `states` module must be only used
    // for unidirectional notification to the view.
    this.store.subscribe('userActions', this.handleUserAction.bind(this));

    // Depending on the configuration, we want either to load the complete form from cache, or just
    // its filled values and restart user's journey from the beginning.
    const cachePromise = this.cache?.get(this.cacheKey) || Promise.resolve(null);
    cachePromise.then((data) => {
      if (data !== null) {
        const cachedData = <CachedData>data;
        this.variables = cachedData.variables;
        if (this.configuration.autoFill !== false) {
          this.userInputs = cachedData.userInputs;
        }
        if (this.configuration.restartOnReload !== true) {
          this.steps = [];
          for (let index = 0, { length } = cachedData.steps; index < length; index += 1) {
            const step = cachedData.steps[index];
            const fieldConfigurations = this.configuration.steps[step.id].fields;
            step.fields = this.withFunctions(step.fields, fieldConfigurations);
            this.steps.push(step);
          }
          this.currentStep = this.steps[this.steps.length - 1];
          this.triggerHooks('start', true);
        }
      } else {
        this.triggerHooks('start', true).then((status) => {
          if (status !== null) {
            this.createStep(this.configuration.root);
          }
        });
      }
    });
  }

  /**
   * Generates step with id `stepId`.
   *
   * @param {string | null} [stepId] Step id.
   *
   * @returns {Step} Generated step.
   */
  public async createStep(stepId?: string | null): Promise<void> {
    if (stepId !== null && stepId !== undefined) {
      const nextStep: Step = {
        id: stepId,
        fields: [],
        status: 'initial',
        index: this.steps.length,
      };
      this.toggleFields(nextStep);
      const updatedNextStep = await this.triggerHooks('step', nextStep);
      if (updatedNextStep !== null) {
        this.updateSteps(this.steps.length, updatedNextStep);
      }
    }
  }

  /**
   * Toggles a loader right after current step, indicating next step is/not being generated.
   *
   * @param {boolean} display Whether to display step loader.
   *
   * @returns {void}
   */
  public toggleLoader(display: boolean): void {
    this.enqueueMutation('SET_LOADER', display);
  }

  /**
   * Returns current store instance.
   *
   * @returns {Store} Current store instance.
   */
  public getStore(): Store {
    return this.store;
  }

  /**
   * Forces a new notification to all `state` module's listeners.
   *
   * @returns {void}
   */
  public forceUpdate(): void {
    if (this.currentStep !== null) {
      this.updateSteps(this.steps.length - 1, this.currentStep);
      this.updateCache();
    }
  }

  /**
   * Registers a new hook for the given event.
   *
   * @param {FormEvent} eventName Name of the event to register hook for.
   *
   * @param {Hook<HookData>} hook Hook to register.
   *
   * @returns {void}
   */
  public on(eventName: FormEvent, hook: Hook<HookData>): void {
    this.hooks[eventName] = [hook].concat(this.hooks[eventName] || []);
  }

  /**
   * Triggers the given user action.
   *
   * @param {UserAction} userAction User action to trigger.
   *
   * @returns {void}
   */
  public userAction(userAction: UserAction): void {
    this.store.mutate('userActions', 'ADD', userAction);
  }

  /**
   * Retrieves current user inputs at `path`. If no path is given, returns all user inputs.
   *
   * @param {string} [path] Input path.
   *
   * @param {boolean} [freeze = true] Whether to make returned input immutable.
   *
   * @returns {UserInputs | UserInput | null} User inputs if they exist, `null` otherwise.
   */
  public getInputs(path?: string, freeze = true): UserInputs | UserInput | null {
    let currentInputs = <UserInput>(this.userInputs);
    const splittedPath = path?.split('.') || [];
    for (let index = 2, { length } = splittedPath; index < length; index += 1) {
      if (currentInputs === undefined || currentInputs === null) {
        return null;
      }
      currentInputs = (<UserInputs>currentInputs)[splittedPath[index]];
    }
    if (currentInputs === undefined) {
      return null;
    }
    return freeze ? deepFreeze(currentInputs) : currentInputs;
  }

  /**
   * Returns gincko field/step's configuration for `path`. If no path is provided, the global form
   * configuration is returned instead.
   *
   * @param {string} [path] Field/step's path to get configuration for.
   *
   * @returns {SubConfiguration} Gincko configuration.
   */
  public getConfiguration(path?: string): SubConfiguration {
    return this.getConfigurations(path).slice(-1)[0];
  }

  /**
   * Returns the generated field at `path`.
   *
   * @param {string} path Path of the field to get, in the current generated form.
   *
   * @returns {Field | null} Generated field if it exists, `null` otherwise.
   */
  public getField(path: string): Field | null {
    const splitted = path.split('.').slice(1);
    const step = this.steps[+splitted[0]];
    let field = step as unknown as Field | null | undefined;
    const configurations = <FieldConfiguration[]>(this.getConfigurations(path));
    for (let index = 1, { length } = splitted; index < length; index += 1) {
      if (field === undefined || field === null) {
        return null;
      }
      const subPath = splitted[index];
      field = (configurations[index].type === 'array')
        ? (<Fields>field.fields)[+subPath]
        : (<Fields>field.fields).find((currentField) => currentField?.id === subPath);
    }
    return (splitted.length < 2) ? null : field || null;
  }

  /**
   * Returns all generated steps.
   *
   * @returns {Step[]} Current step.
   */
  public getSteps(): Step[] {
    return this.steps;
  }

  /**
   * Returns current step.
   *
   * @returns {Step | null} Current step.
   */
  public getCurrentStep(): Step | null {
    return this.currentStep;
  }

  /**
   * Retrieves current form variables.
   *
   * @returns {Variables} Form variables.
   */
  public getVariables(): Variables {
    return deepFreeze(this.variables);
  }

  /**
   * Adds or overrides the given form variables.
   *
   * @param {Variables} variables Form variables to add or override.
   *
   * @returns {void}
   */
  public setVariables(variables: Variables): void {
    this.variables = deepMerge(this.variables, variables);
    this.toggleFields(this.currentStep);
    this.validateFields(true);
    this.forceUpdate();
    this.updateCache();
  }

  /**
   * Clears current form cache.
   *
   * @returns {Promise<void>}
   */
  public async clearCache(): Promise<void> {
    await this.cache?.delete(this.cacheKey);
  }
}
