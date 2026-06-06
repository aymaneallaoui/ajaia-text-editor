import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Avatar, AvatarFallback } from '@repo/ui/components/avatar'
import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import { Checkbox } from '@repo/ui/components/checkbox'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Separator } from '@repo/ui/components/separator'
import { Switch } from '@repo/ui/components/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { env } from '../env'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [dark, setDark] = useState(false)
  const [count, setCount] = useState(0)
  const [agree, setAgree] = useState(false)

  const toggleDark = (next: boolean) => {
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">@repo/ui showcase</h1>
          <p className="text-muted-foreground text-sm">
            API base URL: <code className="font-mono">{env.VITE_API_URL}</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="dark-mode">Dark</Label>
          <Switch id="dark-mode" checked={dark} onCheckedChange={toggleDark} />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Buttons &amp; Badges</CardTitle>
          <CardDescription>class-variance-authority variants</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setCount((c) => c + 1)}>Clicked {count}×</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form controls</CardTitle>
          <CardDescription>Input, Label, Checkbox, Switch (Radix primitives)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="course-title">Course title</Label>
            <Input id="course-title" placeholder="Intro to Bun" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="agree"
              checked={agree}
              onCheckedChange={(value) => setAgree(value === true)}
            />
            <Label htmlFor="agree">I agree to publish this course</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={!agree}>Create course</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabs, Alert &amp; Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="text-muted-foreground pt-2 text-sm">
              The overview tab — switching tabs is handled by Radix.
            </TabsContent>
            <TabsContent value="details" className="text-muted-foreground pt-2 text-sm">
              The details tab — fully keyboard accessible.
            </TabsContent>
          </Tabs>

          <Alert>
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              Every component on this page is imported from <code>@repo/ui</code>.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>BN</AvatarFallback>
            </Avatar>
            <span className="text-sm">Avatar with fallback initials</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
