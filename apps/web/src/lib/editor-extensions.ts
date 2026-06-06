import StarterKit from '@tiptap/starter-kit'

/**
 * The canonical TipTap schema, shared by the live editor AND by `generateJSON`
 * during file import — so an imported .md/.txt produces JSON the editor can open
 * unchanged. StarterKit v3 bundles Underline, so the toolbar's underline command
 * works without a separate extension. Headings are capped at H1–H3.
 *
 * Keep this list free of editor-only/UI extensions (e.g. Placeholder) so the
 * import schema and the editor schema stay identical.
 */
export const editorExtensions = [StarterKit.configure({ heading: { levels: [1, 2, 3] } })]
