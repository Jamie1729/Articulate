import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/lobby')({
  component: LobbyPage,
})

function LobbyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Lobby coming soon…</p>
    </div>
  )
}
