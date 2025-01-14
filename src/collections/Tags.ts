import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
    slug: 'tags',
    fields: [
      {
        name: 'tag',
        type: 'text',
        required: true,
        unique:true
      },
    ],
    admin: {
        useAsTitle: 'tag',
      },
  };
  