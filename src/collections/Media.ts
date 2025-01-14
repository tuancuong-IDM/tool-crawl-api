import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'filename',
  },
  upload: {
    staticDir: 'public/media',
    formatOptions: {
      format: 'webp',
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
      },
      {
        name: 'medium',
        width: 800,
      },
      {
        name:'large',
        width:1440,
      }
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    {
      name: 'url',
      type: 'text',
      required: false,
      unique: false,
      admin: {
        disabled: true,
      },
     
    },
    {
      name: 'filename',
      type: 'text',
      required: false,
      admin: {
        disabled: true,
      },
    }
  ],
  hooks: {
    beforeChange: [
      ({ data, req }:any) => {
        if (data.filename) {
          data.url = `/api/media/file/${data.filename}`

          if (data.sizes) {
            Object.entries(data.sizes).forEach(([size, sizeData]: [string, any]) => {
              if (sizeData.filename) {
                data.sizes[size].url = `/api/media/file/${sizeData.filename}`
              }
            })
            }
        }
        return data
      }
    ],
    afterRead: [
      ({ doc }:any) => {
      if ((doc as {filename:string})?.filename) {
        doc.url = `/api/media/file/${doc.filename}`
        
        if (doc.sizes) {
        Object.entries(doc.sizes).forEach(([size, sizeData]: [string, any]) => {
          if (sizeData.filename) {
          doc.sizes[size].url = `/api/media/file/${sizeData.filename}`
          }
        })
        }
      }
      return doc
      }
    ]
  }
}
