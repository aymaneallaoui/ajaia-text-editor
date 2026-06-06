import { Avatar, AvatarFallback } from '@repo/ui/components/avatar'
import { Button } from '@repo/ui/components/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { unwrap } from '../lib/api'
import { eden } from '../lib/eden'
import { meQuery } from '../lib/queries'

function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
  return letters.toUpperCase() || '?'
}

export function AppHeader() {
  const { data: user } = useQuery(meQuery)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logout = useMutation({
    mutationFn: () => unwrap(eden.api.auth.logout.post()),
    onSuccess: () => {
      queryClient.clear()
      void navigate({ to: '/login' })
    },
  })

  return (
    <header className="border-border/70 bg-background/85 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight">
          Quire
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground hidden text-sm sm:inline">{user.name}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
