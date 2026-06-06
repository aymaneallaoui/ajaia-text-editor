import { Button } from '@repo/ui/components/button'
import { Skeleton } from '@repo/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FileText, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import { OwnedDocumentCard, SharedDocumentCard } from '../../components/document-card'
import { UploadButton } from '../../components/upload-button'
import { errorMessage, unwrap } from '../../lib/api'
import { eden } from '../../lib/eden'
import { documentsQuery } from '../../lib/queries'
import type { DocumentWithRole } from '../../lib/types'

export const Route = createFileRoute('/_authed/')({
  component: Dashboard,
})

function Dashboard() {
  const { data, isPending, isError, error } = useQuery(documentsQuery)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const create = useMutation({
    mutationFn: () => unwrap<DocumentWithRole>(eden.api.documents.post({})),
    onSuccess: async (doc) => {
      await queryClient.invalidateQueries({ queryKey: documentsQuery.queryKey })
      void navigate({ to: '/documents/$id', params: { id: doc.id } })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Create, open, and share your work.</p>
        </div>
        <div className="flex gap-2">
          <UploadButton />
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            <Plus className="size-4" />
            {create.isPending ? 'Creating…' : 'New document'}
          </Button>
        </div>
      </div>

      {isPending ? (
        <DashboardSkeleton />
      ) : isError ? (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage(error, 'Could not load your documents.')}
        </p>
      ) : (
        <div className="flex flex-col gap-11">
          <Section
            title="My documents"
            count={data.owned.length}
            empty="No documents yet — create one or upload a Markdown / text file."
          >
            {data.owned.map((doc) => (
              <OwnedDocumentCard key={doc.id} doc={doc} />
            ))}
          </Section>
          <Section
            title="Shared with me"
            count={data.shared.length}
            empty="Nothing shared with you yet."
          >
            {data.shared.map((doc) => (
              <SharedDocumentCard key={doc.id} doc={doc} />
            ))}
          </Section>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  count,
  empty,
  children,
}: {
  title: string
  count: number
  empty: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
        {title}
        {count > 0 && <span className="ml-1.5 font-normal">· {count}</span>}
      </h2>
      {count === 0 ? (
        <div className="border-border/70 text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
          <FileText className="size-6 opacity-50" />
          <p className="max-w-xs text-sm">{empty}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      )}
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-11">
      {[0, 1].map((s) => (
        <div key={s}>
          <Skeleton className="mb-3 h-3 w-28" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((c) => (
              <Skeleton key={c} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
