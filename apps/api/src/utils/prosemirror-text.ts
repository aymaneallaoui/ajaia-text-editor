/**
 * Extract a plaintext mirror from a TipTap/ProseMirror document. Used to keep
 * `documents.content_text` in sync with the `content` jsonb for search/preview.
 * Walks the node tree, concatenating `text` nodes and inserting newlines at
 * block boundaries. Tolerant of arbitrary/unknown shapes.
 */

const BLOCK_TYPES = new Set([
  'paragraph',
  'heading',
  'blockquote',
  'listItem',
  'list_item',
  'codeBlock',
  'code_block',
  'horizontalRule',
])

interface ProseNode {
  type?: string
  text?: string
  content?: unknown
}

export function prosemirrorToText(doc: unknown): string {
  const parts: string[] = []

  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const n = node as ProseNode
    if (typeof n.text === 'string') parts.push(n.text)
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child)
    }
    if (n.type && BLOCK_TYPES.has(n.type)) parts.push('\n')
  }

  walk(doc)
  return parts
    .join('')
    .replace(/\n{2,}/g, '\n')
    .trim()
}
