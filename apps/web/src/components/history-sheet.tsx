import { Button } from '@repo/ui/components/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components/sheet'
import { Skeleton } from '@repo/ui/components/skeleton'
import { useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'

import { relativeTime } from '../lib/format'
import { versionsQuery } from '../lib/queries'

export function HistorySheet({ documentId }: { documentId: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="size-4" />
          <span className="hidden sm:inline">History</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Version history</SheetTitle>
          <SheetDescription>A snapshot is saved on each content change.</SheetDescription>
        </SheetHeader>
        <HistoryList documentId={documentId} />
      </SheetContent>
    </Sheet>
  )
}

function HistoryList({ documentId }: { documentId: string }) {
  const { data, isPending } = useQuery(versionsQuery(documentId))

  if (isPending) {
    return (
      <div className="flex flex-col gap-3 px-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-muted-foreground px-4 text-sm">
        No versions yet — edits will appear here.
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-4 px-4 pb-6">
      {data.map((version) => (
        <li key={version.id} className="border-border border-l-2 pl-3">
          <p className="line-clamp-1 text-sm font-medium">{version.title || 'Untitled'}</p>
          <p className="text-muted-foreground text-xs">
            {relativeTime(version.createdAt)}
            {version.editedByName ? ` · ${version.editedByName}` : ''}
          </p>
        </li>
      ))}
    </ol>
  )
}
