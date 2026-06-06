import './styles.css'

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { ApiError } from './lib/api'
import { meQuery } from './lib/queries'
import { routeTree } from './routeTree.gen'

// Caches first so we can attach the 401 handler after the client + router exist.
const queryCache = new QueryCache()
const mutationCache = new MutationCache()

const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: { retry: false, staleTime: 30_000, refetchOnWindowFocus: false },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Surface 401s globally: drop the cached user and bounce to /login (unless we're
// already on an auth page). Route guards handle the navigation-time case; this
// covers a session expiring mid-session.
function handleApiError(error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.removeQueries({ queryKey: meQuery.queryKey })
    const path = window.location.pathname
    if (path !== '/login' && path !== '/register') {
      void router.navigate({ to: '/login' })
    }
  }
}
queryCache.config.onError = handleApiError
mutationCache.config.onError = handleApiError

const rootElement = document.getElementById('root')
if (rootElement && !rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
