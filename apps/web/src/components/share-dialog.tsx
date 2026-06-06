import { Button } from '@repo/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog'
import { Input } from '@repo/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { Skeleton } from '@repo/ui/components/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Share2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ApiError, errorMessage, unwrap } from '../lib/api'
import { eden } from '../lib/eden'
import { documentsQuery, sharesQuery } from '../lib/queries'
import type { Collaborator, ShareRole } from '../lib/types'

const ROLES: ShareRole[] = ['viewer', 'commenter', 'editor']
const ROLE_LABEL: Record<ShareRole, string> = {
  viewer: 'Viewer',
  commenter: 'Commenter',
  editor: 'Editor',
}

export function ShareDialog({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="size-4" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>Invite people by email and choose what they can do.</DialogDescription>
        </DialogHeader>
        {open && <ShareBody documentId={documentId} />}
      </DialogContent>
    </Dialog>
  )
}

function ShareBody({ documentId }: { documentId: string }) {
  const queryClient = useQueryClient()
  const shares = useQuery(sharesQuery(documentId))
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<ShareRole>('viewer')

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: sharesQuery(documentId).queryKey }),
      queryClient.invalidateQueries({ queryKey: documentsQuery.queryKey }),
    ])

  const share = useMutation({
    mutationFn: (vars: { email: string; role: ShareRole }) =>
      unwrap<Collaborator>(eden.api.documents({ id: documentId }).shares.post(vars)),
    onSuccess: async (_data, vars) => {
      await invalidate()
      toast.success(`Shared with ${vars.email}`)
      setEmail('')
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError && error.status === 404
          ? 'No user with that email.'
          : errorMessage(error),
      ),
  })

  const changeRole = useMutation({
    mutationFn: (vars: { email: string; role: ShareRole }) =>
      unwrap<Collaborator>(eden.api.documents({ id: documentId }).shares.post(vars)),
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(errorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: (userId: string) =>
      unwrap(eden.api.documents({ id: documentId }).shares({ userId }).delete()),
    onSuccess: async () => {
      await invalidate()
      toast.success('Access removed')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const value = email.trim()
          if (value) share.mutate({ email: value, role })
        }}
      >
        <Input
          type="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Select value={role} onValueChange={(v) => setRole(v as ShareRole)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABEL[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={share.isPending}>
          Add
        </Button>
      </form>

      <div>
        <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">
          People with access
        </p>
        {shares.isPending ? (
          <Skeleton className="h-10 w-full" />
        ) : shares.data && shares.data.length > 0 ? (
          <ul className="flex flex-col divide-y divide-[var(--border)]">
            {shares.data.map((c) => (
              <CollaboratorRow
                key={c.userId}
                collaborator={c}
                disabled={changeRole.isPending || remove.isPending}
                onRoleChange={(r) => changeRole.mutate({ email: c.email, role: r })}
                onRemove={() => remove.mutate(c.userId)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground py-3 text-sm">No collaborators yet.</p>
        )}
      </div>
    </div>
  )
}

function CollaboratorRow({
  collaborator,
  onRoleChange,
  onRemove,
  disabled,
}: {
  collaborator: Collaborator
  onRoleChange: (role: ShareRole) => void
  onRemove: () => void
  disabled: boolean
}) {
  return (
    <li className="flex items-center gap-2 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{collaborator.name}</p>
        <p className="text-muted-foreground truncate text-xs">{collaborator.email}</p>
      </div>
      <Select
        value={collaborator.role}
        onValueChange={(v) => onRoleChange(v as ShareRole)}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABEL[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={`Remove ${collaborator.name}`}
        onClick={onRemove}
        disabled={disabled}
      >
        <X className="size-4" />
      </Button>
    </li>
  )
}
