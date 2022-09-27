/**
 * Copyright (c) Openizr. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export default <Configuration>{
  root: 'root',
  steps: {
    root: {
      submit: true,
      nextStep() {
        return 'second';
      },
      fields: {
        message: {
          type: 'null',
          component: 'Message',
        },
        stringRequired: {
          type: 'string',
          component: 'String',
          required: true,
        },
        nestedArray: {
          type: 'array',
          component: 'Array',
          required: true,
          messages: {
            required: 'ARRAY REQUIRED',
            validation(value): string | null {
              if (value.length < 3) {
                return 'AT LEAST 3 ITEMS';
              }
              return null;
            },
          },
          fields: {
            type: 'array',
            required: true,
            component: 'Array',
            messages: {
              required: 'REQUIRED',
              validation(value): string | null {
                if (value.length < 2) {
                  return 'AT LEAST 2 ITEMS';
                }
                return null;
              },
            },
            fields: {
              type: 'string',
              required: true,
              component: 'String',
              messages: {
                required: 'REQUIRED',
                validation(value): string | null {
                  if (value !== 'valid') {
                    return 'BAD STRING';
                  }
                  return null;
                },
              },
            },
          },
        },
        stringCondition: {
          type: 'string',
          component: 'String',
          messages: {
            validation(_value, _inputs, variables): string | null {
              return variables.newTest === true ? 'BAD STRING' : null;
            },
          },
          defaultValue: 'ok',
        },
        integerCondition: {
          type: 'integer',
          component: 'Integer',
          renderCondition(_inputs, variables): boolean {
            return (<Variables>variables.nested)?.test !== 'ok';
          },
        },
        conditionalArray: {
          type: 'array',
          component: 'Array',
          messages: {
            validation(value): string | null {
              if (value.length < 3) {
                return 'AT LEAST 3 ITEMS';
              }
              return null;
            },
          },
          componentProps: {
            minItems: 3,
          },
          renderCondition(inputs): boolean {
            return inputs.stringCondition === 'valid';
          },
          fields: {
            type: 'array',
            component: 'Array',
            componentProps: {
              minItems: 2,
            },
            fields: {
              type: 'string',
              required: true,
              component: 'String',
              messages: {
                required: 'REQUIRED',
                validation(value): string | null {
                  if (value !== 'oazdk') {
                    return 'BAD STRING';
                  }
                  return null;
                },
              },
              renderCondition(inputs): boolean {
                return inputs.integerCondition === 2;
              },
            },
          },
        },
        nestedObject: {
          type: 'object',
          component: 'Object',
          fields: {
            object: {
              type: 'object',
              required: true,
              component: 'Object',
              fields: {
                string: {
                  type: 'string',
                  component: 'String',
                },
              },
            },
          },
        },
        nestedDynamicObject: {
          type: 'dynamicObject',
          component: 'Object',
          fields: {
            '^[a-z]+$': {
              type: 'object',
              component: 'Object',
              fields: {
                string: {
                  type: 'string',
                  component: 'String',
                },
              },
            },
            '^[0-9]+$': {
              type: 'object',
              component: 'Object',
              fields: {
                integer: {
                  type: 'integer',
                  component: 'Integer',
                },
              },
            },
          },
        },
        submit: {
          type: 'array',
          component: 'Array',
          fields: {
            type: 'boolean',
            component: 'Button',
            submit: true,
          },
        },
      },
    },
    second: {
      fields: {
        submit: {
          type: 'boolean',
          component: 'Button',
        },
      },
    },
  },
};
