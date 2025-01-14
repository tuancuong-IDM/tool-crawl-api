import { slateEditor } from '@payloadcms/richtext-slate'
import type { CollectionConfig } from 'payload'

export const Article: CollectionConfig = {
  slug: 'article',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'status', 'cat_id', 'updatedAt'],
  },
  access: {
    read: () => true,
    update: () => true,
    delete: () => true,
    create: () => true,
  },
  hooks: {
    beforeValidate: [
      async ({ data }) => {
        // Ensure cat_id is properly handled
        if (!data?.cat_id) {
          throw new Error('Category is required')
        }

        if (!data.title_rewrite && data.title) {
          data.title_rewrite = data.title
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
        }

        if (!data.title_rewrite_en && data.title_en) {
          data.title_rewrite_en = data.title_en
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
        }

        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nội dung chính',
          fields: [
            {
              name: 'cat_id',
              type: 'relationship',
              relationTo: 'categories',
              required: true,
              hasMany: false,
              admin: {
                description: 'Chọn danh mục cho bài viết',
              },
            },
            {
              name:'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              admin: {
                position:'sidebar'
              },
            },
            
            {
              name: 'group_type',
              type: 'select',
              options: [{ label: 'News', value: 'news' }],
              defaultValue: 'news',
              required: true,
            },
            {
              name:'author_writer',
              type:'text',
            },
            {
              name:'author_photo',
              type:'text',
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'Nhập tiêu đề bài viết...',
              },
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
              name: 'content',
              type: 'richText',
              required: true,
              editor: slateEditor({
                admin: {
                  elements: [
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                    'blockquote',
                    'ul',
                    'ol',
                    'link',
                    'relationship',
                    'upload',
                  ],
                  leaves: ['bold', 'italic', 'underline', 'strikethrough', 'code'],
                  link: {
                    fields: [
                      {
                        name: 'rel',
                        label: 'Rel Attribute',
                        type: 'select',
                        options: ['noopener', 'noreferrer', 'nofollow'],
                      },
                      {
                        name: 'target',
                        label: 'Target',
                        type: 'select',
                        options: [
                          {
                            label: 'Self',
                            value: '_self',
                          },
                          {
                            label: 'Blank',
                            value: '_blank',
                          },
                        ],
                      },
                    ],
                  },
                  upload: {
                    collections: {
                      media: {
                        fields: [
                          {
                            name: 'caption',
                            type: 'text',
                            label: 'Caption',
                          },
                          {
                            name: 'alignment',
                            type: 'radio',
                            label: 'Alignment',
                            options: [
                              {
                                label: 'Left',
                                value: 'left',
                              },
                              {
                                label: 'Center',
                                value: 'center',
                              },
                              {
                                label: 'Right',
                                value: 'right',
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              }),
            },
            {
              name: 'content_en',
              type: 'richText',
              editor: slateEditor({
                admin: {
                  elements: [
                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',
                    'blockquote',
                    'ul',
                    'ol',
                    'link',
                    'relationship',
                    'upload',
                  ],
                  leaves: ['bold', 'italic', 'underline', 'strikethrough', 'code'],
                  link: {
                    fields: [
                      {
                        name: 'rel',
                        label: 'Rel Attribute',
                        type: 'select',
                        options: ['noopener', 'noreferrer', 'nofollow'],
                      },
                      {
                        name: 'target',
                        label: 'Target',
                        type: 'select',
                        options: [
                          {
                            label: 'Self',
                            value: '_self',
                          },
                          {
                            label: 'Blank',
                            value: '_blank',
                          },
                        ],
                      },
                    ],
                  },
                  upload: {
                    collections: {
                      media: {
                        fields: [
                          {
                            name: 'caption',
                            type: 'text',
                            label: 'Caption',
                          },
                          {
                            name: 'alignment',
                            type: 'radio',
                            label: 'Alignment',
                            options: [
                              {
                                label: 'Left',
                                value: 'left',
                              },
                              {
                                label: 'Center',
                                value: 'center',
                              },
                              {
                                label: 'Right',
                                value: 'right',
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              }),
            },
        
          ],
        },
        {
          label: 'SEO & Meta',
          fields: [
            {
              name: 'website_title',
              type: 'text',
            },
            {
              name: 'meta_keyword',
              type: 'text',
            },
            {
              name: 'meta_description',
              type: 'textarea',
            },
            {
              name: 'title_rewrite',
              type: 'text',
              index: true,
              unique: true,
              required:true,
              admin: {
                description: 'URL friendly của bài viết ',
              },
            },
            {
              name: 'title_rewrite_en',
              type: 'text',
              index: true,
              unique: true,
              required:true,
              admin: {
                description: 'URL friendly của bài viết (tiếng Anh)',
              },
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'image_size_01',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name:'link',
              label:"Link Video Youtube",
              type:'text',
            },
            {
              name: 'description',
              type: 'text',
            },
            {
              name: 'description_en',
              type: 'text',
            },
          ],
        },
      ],
    },
    
  ],
  timestamps: true,
}
