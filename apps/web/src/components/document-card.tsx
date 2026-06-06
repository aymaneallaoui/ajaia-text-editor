import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog'
import { Card } from '@repo/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { FileText, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { errorMessage, unwrap } from '../lib/api'
import { eden } from '../lib/eden'
import { relativeTime } from '../lib/format'
import { documentsQuery } from '../lib/queries'
import type { DocumentListItem, SharedDocumentItem } from '../lib/types'
import { RoleBadge } from './role-badge'

function CardShell({
  doc,
  action,
  children,
}: {
  doc: DocumentListItem
  action?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Card className="hover:border-primary/40 group relative flex flex-col gap-3 p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <FileText className="text-muted-foreground mt-0.5 size-5 shrink-0" />
        {action}
      </div>
      <Link
        to="/documents/$id"
        params={{ id: doc.id }}
        className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none"
      >
        <h3 className="font-display line-clamp-2 text-lg font-medium leading-snug tracking-tight">
          {doc.title || 'Untitled'}
        </h3>
      </Link>
      <div className="text-muted-foreground mt-auto flex items-center justify-between gap-2 text-xs">
        <span>Edited {relativeTime(doc.updatedAt)}</span>
        {children}
      </div>
    </Card>
  )
}

export function OwnedDocumentCard({ doc }: { doc: DocumentListItem }) {
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const remove = useMutation({
    mutationFn: () => unwrap(eden.api.documents({ id: doc.id }).delete()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentsQuery.queryKey })
      toast.success('Document deleted')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  return (
    <>
      <CardShell
        doc={doc}
        action={
          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground hover:bg-secondary hover:text-foreground relative z-10 -mr-1 -mt-1 rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Document actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault()
                  setConfirmOpen(true)
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{doc.title || 'Untitled'}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves the document to deleted. You can no longer open or share it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => remove.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function SharedDocumentCard({ doc }: { doc: SharedDocumentItem }) {
  return (
    <CardShell doc={doc} action={<RoleBadge role={doc.role} />}>
      <span className="truncate" title={doc.owner.email}>
        by {doc.owner.name}
      </span>
    </CardShell>
  )
}
