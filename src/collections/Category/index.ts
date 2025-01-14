import CustomCategory from '@/components/CustomCategory'
import type { CollectionConfig } from 'payload'
export const Category: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    components:{
      beforeList:[
        {path:'src/components/CustomCategory'},
      ],
    }
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'title_en',
      type: 'text',
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'subtitle_en', 
      type: 'text',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany:true,
      admin: {
        position: 'sidebar',
        description: 'Select a parent category to create hierarchy',
        style: {
          marginBottom: '20px',
          
        },
        allowCreate:false,
      },
      filterOptions: ({ id }) => {
        return {
          id: {
            not_equals: id
          }
        }
      }
    },
 
    {
      name: 'level',
      type: 'number',
      max:3,
      admin: {
        position: 'sidebar',
        description: 'Category level (1 or 2 or 3)'
      },
      defaultValue:1,
      hooks: {
        beforeChange: [
        ]
      }
    },
    {
      name: 'alias',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'alias_en',
      type: 'text',
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 1,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: '1',
      options: [
        {
          label: 'Active',
          value: '1',
        },
        {
          label: 'Inactive',
          value: '0',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
    ]
  },
  timestamps: true,
}
