import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LogOut } from 'lucide-react'

export const Route = createFileRoute('/_authed/home')({
  component: HomePage,
})

function HomePage() {
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()
  const [lobbyCode, setLobbyCode] = useState('')

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">Articulate</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {auth?.user?.name}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut size={14} />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 space-y-10">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {auth?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">Ready to play?</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Create a lobby</CardTitle>
              <CardDescription>
                Start a new game and share the code with friends
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
                className="text-center tracking-widest font-mono"
              />
              <Button
                className="w-full"
                disabled={lobbyCode.length < 4}
                onClick={() => navigate({ to: '/lobby/$lobbyId', params: { lobbyId: lobbyCode } })}
              >
                Join
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats — placeholder for future */}
        <div>
          <Separator className="mb-6" />
          <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Games Played', value: '—' },
              { label: 'Wins', value: '—' },
              { label: 'Words Described', value: '—' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
