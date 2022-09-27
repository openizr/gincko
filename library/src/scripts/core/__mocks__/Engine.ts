/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Form engine mock.
 */
export default class Engine {
  private configuration: Record<string, FieldConfiguration>;

  private store: { mutate: Any; };

  private currentStep: Step | null;

  private field: Field | null;

  private steps: Step[];

  public updater: () => void;

  public toggleFields: () => void;

  public toggleLoader: () => void;

  public validateFields: () => void;

  public createStep: () => Promise<void>;

  constructor() {
    this.hooks = {};
    this.configuration = {
      'root.0.field': {
        type: 'string',
        component: 'Null',
      },
      'root.0.boolean': {
        type: 'boolean',
        component: 'Null',
      },
      'root.0.float': {
        type: 'float',
        component: 'Null',
      },
      'root.0.integer': {
        type: 'integer',
        component: 'Null',
      },
      'root.0.dynamicObject': {
        type: 'dynamicObject',
        component: 'Null',
        fields: {},
      },
      'root.0.array': {
        type: 'array',
        component: 'Null',
        fields: { type: 'string', component: 'Null' },
      },
      'root.0.date': {
        type: 'date',
        component: 'Null',
      },
      'root.0.array.0': {
        type: 'dynamicObject',
        component: 'Null',
        fields: {
          __: {
            type: 'object',
            component: 'Null',
            fields: {
              string: {
                type: 'string',
                component: 'Null',
              },
            },
          },
          '000': {
            type: 'array',
            component: 'Null',
            fields: {
              type: 'integer',
              component: 'Null',
            },
          },
        },
      },
      'root.0.array.0.__': {
        type: 'object',
        component: 'Null',
        fields: {
          string: {
            type: 'string',
            component: 'Null',
          },
        },
      },
      'root.0.array.0.000': {
        type: 'array',
        component: 'Null',
        fields: {
          type: 'integer',
          component: 'Null',
        },
      },
      'root.0.array.0.000.': {
        type: 'integer',
        component: 'Null',
      },
      'root.0.array.0.__.string': {
        type: 'string',
        component: 'Null',
      },
      'root.0.submit': {
        submit: true,
        type: 'string',
        component: 'Null',
      },
    };
    this.currentStep = (process.env.NULL_CURRENT_STEP === 'true') ? null : {
      id: 'root',
      index: 0,
      fields: [],
      status: (process.env.ERROR_CURRENT_STEP === 'true') ? 'error' : 'initial',
    };
    this.field = {
      id: 'test',
      status: 'initial',
      component: 'Null',
      componentProps: {},
    };
    this.steps = [{
      id: 'root',
      index: 0,
      status: 'success',
      fields: [
        null,
        {
          id: 'field1',
          value: 'test',
          component: 'Null',
          status: 'success',
          componentProps: {},
        },
        {
          id: 'array',
          component: 'Null',
          status: 'success',
          componentProps: {},
          fieldIds: [0],
          fields: [{
            id: '0',
            component: 'Null',
            componentProps: {},
            status: 'success',
            fieldIds: ['__', '000'],
            fields: [{
              id: '__',
              component: 'Null',
              status: 'success',
              componentProps: {},
              fieldIds: ['string'],
              fields: [{
                id: 'string',
                value: 'value',
                status: 'success',
                component: 'Null',
                componentProps: {},
              }],
            }, {
              id: '000',
              component: 'Null',
              status: 'success',
              componentProps: {},
              fields: [{
                id: '0',
                value: 42,
                status: 'initial',
                component: 'Null',
                componentProps: {},
              }],
            }],
          }],
        },
      ],
    }];
    this.updater = vi.fn();
    this.createStep = vi.fn();
    this.toggleLoader = vi.fn();
    this.toggleFields = vi.fn();
    this.validateFields = vi.fn();
    this.store = { mutate: vi.fn() };
  }

  protected hooks: { [eventName: string]: Hook<HookData>; };

  public on(eventName: FormEvent, hook: Hook<HookData>): void {
    this.hooks[eventName] = hook;
  }

  public async trigger(eventName: FormEvent, data: HookData): Promise<HookData | null> {
    return this.hooks[eventName](data, (newData) => (process.env.NULL_NEXT_DATA === 'true'
      ? Promise.resolve(null)
      : Promise.resolve(newData)
    ));
  }

  public getConfiguration(path?: string): FieldConfiguration {
    return this.configuration[path || ''] || null;
  }

  public getCurrentStep(): Step | null {
    return this.currentStep;
  }

  public getStore(): { mutate: Any; } {
    return this.store;
  }

  public getField(path: string): Field | null {
    return (path === 'root.0.wrong.path')
      ? null
      : this.field;
  }

  public getSteps(): Step[] {
    return this.steps;
  }
}
