import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex gap-4 border-b p-4">
        <Link to="/" className="font-medium [&.active]:underline">
          Home
        </Link>
      </nav>
      <main className="p-8">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  )
}
