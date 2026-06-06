import { Button } from '@repo/ui/components/button'
import { Skeleton } from '@repo/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import Placeholder from '@tiptap/extension-placeholder'
import { type Content, EditorContent, useEditor } from '@tiptap/react'
import { ArrowLeft, FileWarning } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { EditorToolbar } from '../../components/editor-toolbar'
import { HistorySheet } from '../../components/history-sheet'
import { type SaveState, SaveStatus } from '../../components/save-status'
import { ShareDialog } from '../../components/share-dialog'
import { ApiError, unwrap } from '../../lib/api'
import { eden } from '../../lib/eden'
import { editorExtensions } from '../../lib/editor-extensions'
import { documentQuery, documentsQuery } from '../../lib/queries'
import { canEdit, canManageSharing, type DocumentWithRole } from '../../lib/types'

export const Route = createFileRoute('/_authed/documents/$id')({
  component: EditorPage,
})

const EMPTY_DOC: Content = { type: 'doc', content: [{ type: 'paragraph' }] }

/** Tolerate the DB's `{}` default / null — coerce to a valid empty TipTap doc. */
function toEditorContent(content: unknown): Content {
  if (content && typeof content === 'object' && 'type' in content) return content as Content
  return EMPTY_DOC
}

function EditorPage() {
  const { id } = Route.useParams()
  const { data: doc, isPending, isError, error } = useQuery(documentQuery(id))

  if (isPending) return <EditorSkeleton />
  if (isError) {
    const noAccess = error instanceof ApiError && [403, 404].includes(error.status)
    if (noAccess) return <NotFoundScreen />
    return (
      <p className="text-destructive mx-auto max-w-2xl px-5 py-20 text-center text-sm" role="alert">
        Could not load this document.
      </p>
    )
  }
  return <DocumentEditor key={doc.id} doc={doc} />
}

function DocumentEditor({ doc }: { doc: DocumentWithRole }) {
  const queryClient = useQueryClient()
  const editable = canEdit(doc.role)
  const isOwner = canManageSharing(doc.role)

  const [title, setTitle] = useState(doc.title)
  const [status, setStatus] = useState<SaveState>('idle')

  const pending = useRef<{ title?: string; content?: Record<string, unknown> }>({})
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useMutation({
    mutationFn: (patch: { title?: string; content?: Record<string, unknown> }) =>
      unwrap<DocumentWithRole>(eden.api.documents({ id: doc.id }).patch(patch)),
    onSuccess: (updated) => {
      setStatus('saved')
      queryClient.setQueryData(documentQuery(doc.id).queryKey, updated)
      void queryClient.invalidateQueries({ queryKey: documentsQuery.queryKey })
    },
    onError: (_error, variables) => {
      setStatus('error')
      // Keep the failed edit (plus anything newer) so Retry can resend it.
      pending.current = { ...variables, ...pending.current }
    },
  })

  function flush() {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    const patch = pending.current
    pending.current = {}
    if (Object.keys(patch).length > 0) save.mutate(patch)
  }

  function schedule(patch: { title?: string; content?: Record<string, unknown> }) {
    pending.current = { ...pending.current, ...patch }
    setStatus('saving')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(flush, 1500)
  }

  const editor = useEditor(
    {
      editable,
      extensions: [...editorExtensions, Placeholder.configure({ placeholder: 'Start writing…' })],
      content: toEditorContent(doc.content),
      editorProps: {
        attributes: { class: 'doc-prose mx-auto min-h-[60vh] max-w-none focus:outline-none' },
      },
      onUpdate: ({ editor }) => {
        if (editable) schedule({ content: editor.getJSON() as Record<string, unknown> })
      },
    },
    [doc.id],
  )

  // Persist any pending edit when leaving the page quickly.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
      const patch = pending.current
      if (Object.keys(patch).length > 0) void eden.api.documents({ id: doc.id }).patch(patch)
    }
  }, [doc.id])

  return (
    <div>
      <div className="border-border/70 bg-background/85 sticky top-14 z-10 border-b backdrop-blur">
        <div className="mx-auto max-w-3xl px-5">
          <div className="flex items-center gap-3 py-2.5">
            <Link
              to="/"
              aria-label="Back to documents"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                schedule({ title: e.target.value })
              }}
              readOnly={!editable}
              aria-label="Document title"
              placeholder="Untitled"
              className="font-display min-w-0 flex-1 truncate bg-transparent text-lg font-semibold tracking-tight outline-none"
            />
            <SaveStatus status={status} onRetry={flush} />
            <HistorySheet documentId={doc.id} />
            {isOwner && <ShareDialog documentId={doc.id} />}
          </div>
          {editable && editor && (
            <div className="border-border/60 -mx-1 border-t">
              <EditorToolbar editor={editor} />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Skeleton className="h-8 w-1/2" />
      <div className="mt-10 flex flex-col gap-3.5">
        {[92, 80, 86, 70, 88, 64].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

function NotFoundScreen() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-24 text-center">
      <div className="bg-secondary text-muted-foreground rounded-full p-3.5">
        <FileWarning className="size-6" />
      </div>
      <div>
        <h1 className="font-display text-xl font-semibold">Not found or no access</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          This document doesn’t exist, was deleted, or hasn’t been shared with you.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link to="/">
          <ArrowLeft className="size-4" /> Back to documents
        </Link>
      </Button>
    </div>
  )
}
