import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AppHeader } from '../components/app-header'
import { meQuery } from '../lib/queries'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQuery).catch(() => null)
    if (!me) throw redirect({ to: '/login' })
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <Outlet />
    </div>
  )
}
