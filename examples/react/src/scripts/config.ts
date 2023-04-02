// import { errorStepDisplayer } from 'gincko/plugins';
import { Configuration } from 'gincko/core';

export default <Configuration>{
  root: 'root',
  // TODO deepCopy in gincko
  // cache: {
  //   get: async (key: string) => {
  //     const c = await idb.get(key);
  //     return c || null;
  //   },
  //   set: idb.set,
  //   delete: idb.del,
  // },
  steps: {
    root: {
      submit: true,
      fields: {
        taxes: {
          type: 'float',
          required: true,
          component: 'Options',
          componentProps: {
            select: true,
            options: [
              {
                type: 'option',
                value: '0',
                label: '0% TVA',
              },
              {
                type: 'option',
                value: '5.5',
                label: '5.5% TVA',
              },
              {
                type: 'option',
                value: '10',
                label: '10% TVA',
              },
              {
                type: 'option',
                value: '20',
                label: '20% TVA',
              },
            ],
          },
          messages: {
            required:
              'Ce champ est requis',
          },
        },
        rows: {
          type: 'array',
          label: 'Rédaction',
          component: 'Array',
          componentProps: {
            labels: {
              add: 'Ajouter une ligne',
            },
          },
          fields: {
            type: 'object',
            component: 'Object',
            fields: {
              title: {
                type: 'string',
                required: true,
                component: 'Textfield',
                componentProps: {
                  maxlength: 100,
                  placeholder:
                    'Titre',
                },
                messages: {
                  required:
                    'Ce champ est requis',
                },
              },
              unitPrice: {
                type: 'float',
                required: true,
                value: 0,
                label: '€ HT/unité',
                component: 'Textfield',
                componentProps: {
                  modifiers: 'suffixed',
                },
                messages: {
                  required:
                    'Ce champ est requis',
                },
              },
              unitPriceIT: {
                type: 'integer',
                component: 'Null',
              },
              quantity: {
                value: 1,
                type: 'integer',
                required: true,
                label: 'Qté.',
                component: 'Textfield',
                componentProps: {
                  min: 0,
                  step: 1,
                  type: 'number',
                  modifiers: 'suffixed',
                },
                messages: {
                  required: 'Ce champ est requis',
                  validation(newValue): string | null {
                    if (newValue < 0) {
                      return 'Quantité invalide';
                    }
                    return null;
                  },
                },
              },
              discount: {
                value: 0,
                type: 'integer',
                required: true,
                label: '% remise',
                component: 'Textfield',
                componentProps: {
                  min: 0,
                  step: 1,
                  max: 100,
                  type: 'number',
                  modifiers: 'suffixed',
                },
                messages: {
                  required: 'Ce champ est requis',
                  validation(newValue): string | null {
                    if (newValue < 0) {
                      return 'Quantité invalide';
                    }
                    return null;
                  },
                },
              },
              description: {
                type: 'string',
                component: 'Textarea',
                componentProps: {
                  rows: 1,
                  minLength: 1,
                  maxlength: 5000,
                  placeholder: 'Description',
                },
              },
            },
          },
        },
        go: {
          type: 'integer',
          submit: true,
          component: 'Null',
        },
      },
    },
  },
};
