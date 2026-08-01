import {defineField, defineType} from 'sanity'
import {CATEGORIES} from './constants'

export const film = defineType({
  name: 'film',
  title: 'Film',
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
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: CATEGORIES},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'mux.video',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail (optional — falls back to Mux\'s generated poster)',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
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
      title: 'title',
      subtitle: 'category',
      media: 'thumbnail',
    },
  },
})
