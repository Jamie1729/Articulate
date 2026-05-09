import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { HostSidebar } from "@/components/lobby/host-sidebar";
import { toast } from "sonner";
import { Copy, Check, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import {
  joinAndGetLobby,
  setTeam,
  assignTeam,
  kickPlayer,
  leaveLobby,
} from "@/lib/server/lobby";
import { PlayerItem } from "@/components/lobby/player-item";

function KickedErrorComponent() {
  const navigate = useNavigate();
  useEffect(() => {
    toast.error("You have been kicked from this lobby");
    navigate({ to: "/home" });
  }, []);
  return null;
}

export const Route = createFileRoute("/_authed/lobby/$lobbyId")({
  validateSearch: () => ({}),
  loader: ({ params }) => joinAndGetLobby({ data: params.lobbyId }),
  errorComponent: ({ error }) => {
    if (
      error instanceof Error &&
      error.message === "You have been kicked from this lobby"
    ) {
      return <KickedErrorComponent />;
    }
    throw error;
  },
  component: LobbyPage,
});

const TEAM_COLORS = [
  { border: "border-blue-200", bg: "bg-blue-50", heading: "text-blue-700" },
  { border: "border-red-200", bg: "bg-red-50", heading: "text-red-700" },
  { border: "border-green-200", bg: "bg-green-50", heading: "text-green-700" },
  {
    border: "border-yellow-200",
    bg: "bg-yellow-50",
    heading: "text-yellow-700",
  },
  {
    border: "border-purple-200",
    bg: "bg-purple-50",
    heading: "text-purple-700",
  },
  {
    border: "border-orange-200",
    bg: "bg-orange-50",
    heading: "text-orange-700",
  },
] as const;

const GRID_COLS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2",
  5: "grid-cols-3",
  6: "grid-cols-3",
};

function LobbyPage() {
  const { lobby, currentUserId } = Route.useLoaderData();
  const router = useRouter();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const { numTeams, teamAssignment } = lobby.settings;
  const numTeamsNum = parseInt(numTeams);
  const teamNumbers = Array.from({ length: numTeamsNum }, (_, i) => i + 1);
  const isHost = lobby.hostId === currentUserId;

  const currentUser = lobby.players.find((p) => p.userId === currentUserId);

  const playersByTeam: Record<number, typeof lobby.players> = {};
  const unassigned: typeof lobby.players = [];
  for (const player of lobby.players) {
    if (player.teamNumber === null) {
      unassigned.push(player);
    } else {
      playersByTeam[player.teamNumber] ??= [];
      playersByTeam[player.teamNumber].push(player);
    }
  }

  useEffect(() => {
    let channel = supabase.channel(`lobby:${lobby.id}`);

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobby_players",
          filter: `lobby_id=eq.${lobby.id}`,
        },
        () => router.invalidate(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `id=eq.${lobby.id}`,
        },
        () => router.invalidate(),
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ userId: string }>();
        const ids = new Set(
          Object.values(state)
            .flat()
            .map((p) => p.userId),
        );
        setOnlineUsers(ids);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && currentUser) {
          await channel.track({
            userId: currentUserId,
            name: currentUser.user.name,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobby.id]);

  const allAssigned = unassigned.length === 0;
  const canStart = isHost && (allAssigned || teamAssignment === "random");

  const copyCode = async () => {
    await navigator.clipboard.writeText(lobby.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    await leaveLobby({ data: lobby.code });
    navigate({ to: "/home" });
  };

  const handleSetTeam = async (teamNumber: number | null) => {
    await setTeam({ data: { code: lobby.code, teamNumber } });
    router.invalidate();
  };

  const handleAssignTeam = async (
    userId: string,
    teamNumber: number | null,
  ) => {
    await assignTeam({ data: { code: lobby.code, userId, teamNumber } });
    router.invalidate();
  };

  const handleKick = async (userId: string) => {
    await kickPlayer({ data: { code: lobby.code, userId } });
    router.invalidate();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 grid grid-cols-3 items-center w-full">
        <Link className="font-bold text-lg tracking-tight" to="/home">
          Articulate
        </Link>

        <Button
          variant="ghost"
          onClick={copyCode}
          className="font-mono font-bold text-lg tracking-widest"
          title="Click to copy"
        >
          {lobby.code}
          {copied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} className="text-muted-foreground" />
          )}
        </Button>

        <div className="flex justify-end gap-1">
          {isHost && (
            <HostSidebar
              lobbyCode={lobby.code}
              initialSettings={lobby.settings}
              onSettingsSaved={() => router.invalidate()}
            />
          )}
          <Button variant="ghost" size="sm" onClick={handleLeave}>
            <LogOut size={14} />
            Leave
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Waiting Room</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {lobby.players.length} player
              {lobby.players.length !== 1 ? "s" : ""} joined
            </p>
          </div>
          {!allAssigned && teamAssignment !== "random" && (
            <p className="text-sm text-amber-600 font-medium">
              {unassigned.length} unassigned
            </p>
          )}
        </div>

        {teamAssignment === "random" ? (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Players</Label>
            <div className="flex flex-wrap gap-2">
              {lobby.players.map((p) => (
                <PlayerItem
                  key={p.userId}
                  player={p}
                  isYou={p.userId === currentUserId}
                  isHost={p.userId === lobby.hostId}
                  isOnline={onlineUsers.has(p.userId)}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Teams will be assigned randomly when the game starts.
            </p>
          </div>
        ) : (
          <>
            <div
              className={`grid gap-4 ${GRID_COLS[numTeamsNum] ?? "grid-cols-2"}`}
            >
              {teamNumbers.map((team) => {
                const color = TEAM_COLORS[(team - 1) % TEAM_COLORS.length];
                const players = playersByTeam[team] ?? [];
                return (
                  <div
                    key={team}
                    className={`rounded-lg border-2 ${color.border} ${color.bg} p-4 space-y-2 min-h-28`}
                  >
                    <p className={`text-sm font-semibold ${color.heading}`}>
                      Team {team}
                    </p>
                    {players.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Empty
                      </p>
                    )}
                    {players.map((p) => (
                      <PlayerItem
                        key={p.userId}
                        player={p}
                        isYou={p.userId === currentUserId}
                        isHost={p.userId === lobby.hostId}
                        isOnline={onlineUsers.has(p.userId)}
                        onKick={
                          isHost && p.userId !== currentUserId
                            ? () => handleKick(p.userId)
                            : undefined
                        }
                        canControl={
                          (teamAssignment === "self" &&
                            p.userId === currentUserId) ||
                          (teamAssignment === "host" && isHost)
                        }
                        currentTeam={team}
                        teamNumbers={teamNumbers}
                        onSetTeam={
                          teamAssignment === "self"
                            ? handleSetTeam
                            : (t) => handleAssignTeam(p.userId, t)
                        }
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            {unassigned.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-1.5">
                  <Users size={13} /> Unassigned
                </Label>
                <div className="flex flex-wrap gap-2">
                  {unassigned.map((p) => (
                    <PlayerItem
                      key={p.userId}
                      player={p}
                      isYou={p.userId === currentUserId}
                      isHost={p.userId === lobby.hostId}
                      isOnline={onlineUsers.has(p.userId)}
                      canControl={
                        (teamAssignment === "self" &&
                          p.userId === currentUserId) ||
                        (teamAssignment === "host" && isHost)
                      }
                      currentTeam={null}
                      teamNumbers={teamNumbers}
                      onSetTeam={
                        teamAssignment === "self"
                          ? handleSetTeam
                          : (t) => handleAssignTeam(p.userId, t)
                      }
                      onKick={
                        isHost && p.userId !== currentUserId
                          ? () => handleKick(p.userId)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="pt-4">
          {isHost ? (
            <Button size="lg" className="w-full" disabled={!canStart}>
              {canStart
                ? "Start Game"
                : `${unassigned.length} player${unassigned.length !== 1 ? "s" : ""} still unassigned`}
            </Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Waiting for the host to start the game…
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
