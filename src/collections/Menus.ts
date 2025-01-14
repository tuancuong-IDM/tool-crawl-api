import type { CollectionConfig, CollectionSlug } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
export const Menus: CollectionConfig = {
  slug: 'menu',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'mainMenu',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      unique: true,
      admin: {
        allowCreate: false,
      },
    },

    {
      name: 'subMenu',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      validate: (value, { data }: { data: any }) => {
        if (value && data?.mainMenu && value.includes(data?.mainMenu)) {
          return 'SubMenu cannot contain the selected MainMenu.'
        }
        return true
      },
      admin: {
        allowCreate: false,
      },
    },
    {
      name: 'position',
      type: 'number',
      label: 'Position',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const { mainMenu, subMenu } = data
        if (mainMenu && subMenu && subMenu.includes(mainMenu)) {
          throw new Error('SubMenu cannot contain the selected MainMenu.')
        }
        return data
      },
      async ({ data, req }) => {
        const { position } = data
        const existingMenu = await req.payload.find({
          collection: 'menu',
          where: {
            position: { equals: position },
          },
          limit: 1,
        })

        if (existingMenu.docs.length > 0) {
          throw new Error(`A menu with position ${position} already exists.`)
        }

        return data
      },
    ],
  },
}
