/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Engine from 'scripts/core/Engine';

/*
 * Exposes protected methods of the Engine class for testing purposes.
 */
export default class TestEngine extends Engine {
  protected updater(): void {
    this.getConfiguration();
  }

  public getConfigurations(path?: string): SubConfiguration[] {
    return super.getConfigurations(path);
  }

  public setInput(path: string, userInput: UserInput): void {
    super.setInput(path, userInput);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async triggerHooks(eventName: FormEvent, data: HookData): Promise<any> {
    return super.triggerHooks(eventName, data);
  }

  public handleSubmit(): Promise<void> {
    return super.handleSubmit();
  }

  public async handleUserAction(userAction: UserAction | null): Promise<void> {
    await super.handleUserAction(userAction);
  }

  public withoutFunctions(steps: Step[]): Step[] {
    return super.withoutFunctions(steps);
  }

  public toggleFields(step: Step | null): void {
    super.toggleFields(step);
  }

  public toggleField(
    path: string,
    parent: Fields,
    fieldIndex: number,
    configuration: FieldConfiguration,
    currentValues: UserInput,
  ): void {
    super.toggleField(path, parent, fieldIndex, configuration, currentValues);
  }

  public areEqual(firstInput: UserInput, secondInput: UserInput, type: string): boolean {
    return super.areEqual(firstInput, secondInput, type);
  }

  public isEmpty(input: UserInput, type: string): boolean {
    return super.isEmpty(input, type);
  }

  public coerceAndCheckInput(userInput: UserInput, type: string): Promise<UserInput> {
    return super.coerceAndCheckInput(userInput, type);
  }

  public validateFields(updatedFieldPaths: string[], partial?: boolean): void {
    super.validateFields(updatedFieldPaths, partial);
  }

  public filterInputs(
    partial: boolean,
    field: Field | null,
    fieldConfiguration: FieldConfiguration,
    currentInitialInput: UserInput,
    filteredInputs: UserInput,
  ): void {
    super.filterInputs(
      partial,
      field,
      fieldConfiguration,
      currentInitialInput,
      filteredInputs,
    );
  }

  public withFunctions(fields: Fields, fieldConfigurations: FieldConfigurations): Fields {
    return super.withFunctions(fields, fieldConfigurations);
  }

  public deepCompare(
    field: Field | null,
    newValue: UserInput,
    fieldConfiguration: FieldConfiguration,
    path: string,
    isRoot?: boolean,
  ): UserAction[] {
    return super.deepCompare(field, newValue, fieldConfiguration, path, isRoot);
  }
}
