import { generateJSON } from '@tiptap/core'
import { marked } from 'marked'

import { editorExtensions } from './editor-extensions'

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 // 2 MB
export const ACCEPTED_EXTENSIONS = ['.md', '.txt'] as const

export interface UploadValidation {
  ok: boolean
  error?: string
}

export function validateUpload(file: File): UploadValidation {
  const name = file.name.toLowerCase()
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return { ok: false, error: 'Only .md and .txt files are supported.' }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'File is too large — the limit is 2 MB.' }
  }
  return { ok: true }
}

export function titleFromFilename(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, '').trim()
  return base || 'Untitled'
}

/**
 * Convert an uploaded file to TipTap JSON using the shared editor schema.
 *   .md  → marked() → HTML → generateJSON(html, editorExtensions)
 *   .txt → one paragraph per line
 */
export async function fileToDocument(file: File): Promise<{ title: string; content: unknown }> {
  const text = await file.text()
  const title = titleFromFilename(file.name)

  if (file.name.toLowerCase().endsWith('.md')) {
    const html = await marked.parse(text)
    return { title, content: generateJSON(html, editorExtensions) }
  }

  const paragraphs = text
    .split(/\r?\n/)
    .map((line) =>
      line.trim().length > 0
        ? { type: 'paragraph', content: [{ type: 'text', text: line }] }
        : { type: 'paragraph' },
    )
  return {
    title,
    content: { type: 'doc', content: paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph' }] },
  }
}
