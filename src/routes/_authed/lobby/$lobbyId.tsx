import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/lobby/$lobbyId')({
  validateSearch: () => ({}),
  component: LobbyPage,
})

function LobbyPage() {
  const { lobbyId } = Route.useParams()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">
        Lobby <span className="font-mono font-bold">{lobbyId}</span>
      </p>
    </div>
  )
}
