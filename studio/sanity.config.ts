import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {muxInput} from 'sanity-plugin-mux-input'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Oros Productions',

  projectId: '3hwrc45l',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => item.getId() !== 'siteSettings'),
          ]),
    }),
    visionTool(),
    muxInput(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // The singleton above is reached by a fixed document ID, so hide the
    // duplicate/delete actions that would otherwise let someone create or
    // remove the one Site Settings document.
    actions: (input, context) =>
      context.schemaType === 'siteSettings'
        ? input.filter(({action}) => action !== 'duplicate' && action !== 'delete')
        : input,
  },
})
