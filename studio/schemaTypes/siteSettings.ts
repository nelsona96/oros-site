import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {name: 'brand', title: 'Brand'},
    {name: 'about', title: 'About'},
    {name: 'contact', title: 'Contact'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Studio name',
      type: 'string',
      group: 'brand',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'brand',
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero loop (silent, looping MP4)',
      type: 'file',
      options: {accept: 'video/mp4'},
      group: 'brand',
    }),
    defineField({
      name: 'heroPoster',
      title: 'Hero poster frame',
      type: 'image',
      options: {hotspot: true},
      group: 'brand',
    }),
    defineField({
      name: 'aboutHeading',
      title: 'About heading',
      type: 'string',
      group: 'about',
    }),
    defineField({
      name: 'aboutBody',
      title: 'About body',
      type: 'text',
      group: 'about',
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: {hotspot: true},
      group: 'about',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact phone',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram handle',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'ogImage',
      title: 'Default social share image',
      type: 'image',
      group: 'seo',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Default meta description',
      type: 'text',
      group: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
