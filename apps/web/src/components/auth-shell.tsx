import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import type { ReactNode } from 'react'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="animate-fade-rise w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-display text-3xl font-semibold tracking-tight">Quire</div>
          <p className="text-muted-foreground mt-1.5 text-sm">A calm home for your documents.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
