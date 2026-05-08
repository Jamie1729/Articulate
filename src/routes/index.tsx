import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Footer } from '@/components/footer'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { auth } = Route.useRouteContext()
  const [lobbyCode, setLobbyCode] = useState('')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">Articulate</span>
        {auth?.isAuthenticated ? (
          <span className="text-sm text-muted-foreground">
            Playing as <span className="text-foreground font-medium">{auth.user?.name}</span>
          </span>
        ) : (
          <Link to="/login" search={{ redirect: '/home' }}>
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-10">
        <div className="text-center space-y-3 max-w-lg">
          <h1 className="text-5xl font-bold tracking-tight">Articulate</h1>
          <p className="text-muted-foreground text-lg">
            Describe the word. Don't say it. Beat the clock.
          </p>
        </div>

        {auth?.isAuthenticated ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Create a lobby</CardTitle>
                <CardDescription>
                  Start a new game and invite your friends
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full" onClick={() => navigate({ to: '/lobby/create' })}>
                  Create Lobby
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Join a lobby</CardTitle>
                <CardDescription>
                  Enter the code from your host
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 mt-auto">
                <Input
                  placeholder="Enter code…"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center tracking-widest font-mono uppercase"
                />
                <Button className="w-full" disabled={lobbyCode.length < 4}>
                  Join
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Link to="/login" search={{ redirect: '/home' }}>
            <Button size="lg" className="px-10">Play Now</Button>
          </Link>
        )}
      </main>

      <Footer />
    </div>
  )
}
