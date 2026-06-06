import { Button } from '@repo/ui/components/button'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { errorMessage, unwrap } from '../lib/api'
import { eden } from '../lib/eden'
import { fileToDocument, validateUpload } from '../lib/import-file'
import { documentsQuery } from '../lib/queries'
import type { DocumentWithRole } from '../lib/types'

export function UploadButton() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file
    if (!file) return

    const check = validateUpload(file)
    if (!check.ok) {
      toast.error(check.error)
      return
    }

    setBusy(true)
    try {
      const { title, content } = await fileToDocument(file)
      const doc = await unwrap<DocumentWithRole>(
        eden.api.documents.post({ title, content: content as Record<string, unknown> }),
      )
      await queryClient.invalidateQueries({ queryKey: documentsQuery.queryKey })
      toast.success(`Imported “${title}”`)
      void navigate({ to: '/documents/$id', params: { id: doc.id } })
    } catch (error) {
      toast.error(errorMessage(error, 'Could not import that file.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".md,.txt"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        title="Markdown (.md) or plain text (.txt), up to 2 MB"
      >
        <Upload className="size-4" />
        {busy ? 'Importing…' : 'Upload'}
      </Button>
    </>
  )
}
