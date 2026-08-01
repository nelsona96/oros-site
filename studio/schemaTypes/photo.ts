import {defineField, defineType} from 'sanity'
import {CATEGORIES} from './constants'

export const photo = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: CATEGORIES},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
    defineField({
      name: 'capture',
      title: 'Capture data',
      type: 'object',
      fields: [
        defineField({name: 'camera', title: 'Camera', type: 'string'}),
        defineField({name: 'lens', title: 'Lens', type: 'string'}),
        defineField({name: 'aperture', title: 'Aperture', type: 'string'}),
        defineField({name: 'shutter', title: 'Shutter speed', type: 'string'}),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured on landing page',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'caption',
      subtitle: 'category',
      media: 'image',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Untitled photo',
        subtitle,
        media,
      }
    },
  },
})
