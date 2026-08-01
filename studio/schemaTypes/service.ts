import {defineField, defineType} from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blurb',
      title: 'Blurb',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
    },
  },
})
