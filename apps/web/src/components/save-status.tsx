import { Button } from '@repo/ui/components/button'
import { Check, CircleAlert, Loader2 } from 'lucide-react'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function SaveStatus({ status, onRetry }: { status: SaveState; onRetry: () => void }) {
  if (status === 'idle') return null

  if (status === 'saving') {
    return (
      <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
        <Loader2 className="size-3.5 animate-spin" /> Saving…
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
        <Check className="size-3.5" /> Saved
      </span>
    )
  }

  return (
    <span className="text-destructive flex shrink-0 items-center gap-1 text-xs">
      <CircleAlert className="size-3.5" /> Save failed
      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={onRetry}>
        Retry
      </Button>
    </span>
  )
}
