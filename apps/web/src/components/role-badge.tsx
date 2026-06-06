import { Badge } from '@repo/ui/components/badge'

import type { EffectiveRole, ShareRole } from '../lib/types'

const LABEL: Record<EffectiveRole, string> = {
  owner: 'Owner',
  editor: 'Editor',
  commenter: 'Commenter',
  viewer: 'Viewer',
}

const DOT: Record<EffectiveRole, string> = {
  owner: 'var(--role-owner)',
  editor: 'var(--role-editor)',
  commenter: 'var(--role-commenter)',
  viewer: 'var(--role-viewer)',
}

export function RoleBadge({ role }: { role: EffectiveRole | ShareRole }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <span aria-hidden className="size-1.5 rounded-full" style={{ background: DOT[role] }} />
      {LABEL[role]}
    </Badge>
  )
}
