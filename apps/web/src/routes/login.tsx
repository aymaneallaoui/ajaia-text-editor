import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AuthShell } from '../components/auth-shell'
import { errorMessage, unwrap } from '../lib/api'
import { eden } from '../lib/eden'
import { meQuery } from '../lib/queries'
import type { User } from '../lib/types'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQuery).catch(() => null)
    if (me) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useMutation({
    mutationFn: () => unwrap<User>(eden.api.auth.login.post({ email, password })),
    onSuccess: (user) => {
      queryClient.setQueryData(meQuery.queryKey, user)
      void navigate({ to: '/' })
    },
  })

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Quire workspace.">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          login.mutate()
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {login.isError && (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage(login.error, 'Invalid email or password.')}
          </p>
        )}
        <Button type="submit" className="mt-1 w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="text-muted-foreground mt-5 text-center text-sm">
        New here?{' '}
        <Link
          to="/register"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
