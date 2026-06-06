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

export const Route = createFileRoute('/register')({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQuery).catch(() => null)
    if (me) throw redirect({ to: '/' })
  },
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const register = useMutation({
    mutationFn: () => unwrap<User>(eden.api.auth.register.post({ name, email, password })),
    onSuccess: (user) => {
      queryClient.setQueryData(meQuery.queryKey, user)
      void navigate({ to: '/' })
    },
  })

  return (
    <AuthShell title="Create your account" subtitle="Start writing and sharing in minutes.">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          register.mutate()
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-muted-foreground text-xs">At least 8 characters.</p>
        </div>
        {register.isError && (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage(register.error)}
          </p>
        )}
        <Button type="submit" className="mt-1 w-full" disabled={register.isPending}>
          {register.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="text-muted-foreground mt-5 text-center text-sm">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
