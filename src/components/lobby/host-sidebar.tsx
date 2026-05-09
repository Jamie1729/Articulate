import { useState } from "react";
import { Settings, UserX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  updateLobbySettings,
  getKickedPlayers,
  unkickPlayer,
} from "@/lib/server/lobby";
import type { LobbySettings } from "@/lib/types";

const CATEGORIES = [
  "Object",
  "Nature",
  "Random",
  "Person",
  "Action",
  "World",
] as const;

type KickedPlayer = { userId: string; user: { id: string; name: string } };

interface HostSidebarProps {
  lobbyCode: string;
  initialSettings: LobbySettings;
  onSettingsSaved: () => void;
}

export function HostSidebar({
  lobbyCode,
  initialSettings,
  onSettingsSaved,
}: HostSidebarProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<LobbySettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [kickedPlayers, setKickedPlayers] = useState<KickedPlayer[] | null>(
    null,
  );
  const [tab, setTab] = useState<"settings" | "kicked">("settings");
  const [loadingKicked, setLoadingKicked] = useState(false);

  const set = <K extends keyof LobbySettings>(
    key: K,
    value: LobbySettings[K],
  ) => setSettings((s) => ({ ...s, [key]: value }));

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setSettings(initialSettings);
      setTab("settings");
    }
    setOpen(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLobbySettings({ data: { code: lobbyCode, settings } });
      toast.success("Settings saved");
      onSettingsSaved();
      setOpen(false);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const loadKickedPlayers = async () => {
    setLoadingKicked(true);
    try {
      const players = await getKickedPlayers({ data: lobbyCode });
      setKickedPlayers(players);
    } catch {
      toast.error("Failed to load kicked players");
    } finally {
      setLoadingKicked(false);
    }
  };

  const handleUnkick = async (userId: string) => {
    try {
      await unkickPlayer({ data: { code: lobbyCode, userId } });
      setKickedPlayers(
        (prev) => prev?.filter((p) => p.userId !== userId) ?? null,
      );
      toast.success("Player unkicked");
      onSettingsSaved();
    } catch {
      toast.error("Failed to unkick player");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <Settings size={14} />
            Settings
          </Button>
        }
      />

      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle>Host Controls</SheetTitle>
        </SheetHeader>

        <Tabs
          value={tab}
          className="flex flex-col flex-1 min-h-0"
          onValueChange={(v) => {
            if (v === "kicked" && kickedPlayers === null) loadKickedPlayers();
            setTab(v as "settings" | "kicked");
          }}
        >
          <TabsList className="mx-5 mt-4 mb-0">
            <TabsTrigger value="settings" className="flex-1 gap-1.5">
              <Settings size={13} /> Settings
            </TabsTrigger>
            <TabsTrigger value="kicked" className="flex-1 gap-1.5">
              <UserX size={13} /> Kicked Players
            </TabsTrigger>
          </TabsList>

          {/* ── Settings Tab ── */}
          <TabsContent
            value="settings"
            className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
          >
            {/* Teams */}
            <section className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Teams
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Number of Teams</Label>
                  <Select
                    value={settings.numTeams}
                    onValueChange={(v) => set("numTeams", v as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} teams
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Team Assignment</Label>
                  <Select
                    value={settings.teamAssignment}
                    onValueChange={(v) =>
                      set(
                        "teamAssignment",
                        v as LobbySettings["teamAssignment"],
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="host">Host assigns</SelectItem>
                      <SelectItem value="self">Players choose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Min per Team</Label>
                  <Input
                    type="number"
                    min={1}
                    value={settings.minPlayersPerTeam}
                    onChange={(e) =>
                      set("minPlayersPerTeam", Number(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Max per Team</Label>
                  <Input
                    type="number"
                    min={1}
                    value={settings.maxPlayersPerTeam}
                    onChange={(e) =>
                      set("maxPlayersPerTeam", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </section>

            {/* Round */}
            <section className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Round
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Round Duration (s)</Label>
                  <Input
                    type="number"
                    min={10}
                    value={settings.roundDuration}
                    onChange={(e) =>
                      set("roundDuration", Number(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Skips per Round</Label>
                  <Select
                    value={settings.numSkips}
                    onValueChange={(v) => set("numSkips", v as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["0", "1", "2", "3", "unlimited"].map((n) => (
                        <SelectItem key={n} value={n}>
                          {n === "unlimited" ? "Unlimited" : n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Skip Behaviour</Label>
                  <Select
                    value={settings.skipBehaviour}
                    onValueChange={(v) =>
                      set("skipBehaviour", v as LobbySettings["skipBehaviour"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="back">Return to deck</SelectItem>
                      <SelectItem value="discard">Discard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Win Condition */}
            <section className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Win Condition
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Win by</Label>
                  <Select
                    value={settings.winCondition}
                    onValueChange={(v) =>
                      set("winCondition", v as LobbySettings["winCondition"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="board">Board completion</SelectItem>
                      <SelectItem value="rounds">Rounds played</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.winCondition === "board" && (
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Board Size</Label>
                    <Input
                      type="number"
                      min={5}
                      value={settings.boardSize}
                      onChange={(e) => set("boardSize", Number(e.target.value))}
                    />
                  </div>
                )}

                {settings.winCondition === "rounds" && (
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Number of Rounds</Label>
                    <Input
                      type="number"
                      min={1}
                      value={settings.numRounds}
                      onChange={(e) => set("numRounds", Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Cards */}
            <section className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Cards
              </p>

              <div className="space-y-2">
                <Label className="text-xs">Categories</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Switch
                        checked={settings.categories[cat]}
                        onCheckedChange={(v) =>
                          set("categories", {
                            ...settings.categories,
                            [cat]: v,
                          })
                        }
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Custom Words</Label>
                <textarea
                  className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="One word per line…"
                  value={settings.customWords}
                  onChange={(e) => set("customWords", e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch
                  checked={settings.allowDuplicates}
                  onCheckedChange={(v) => set("allowDuplicates", v)}
                />
                Allow duplicate words
              </label>
            </section>
          </TabsContent>

          {/* ── Kicked Players Tab ── */}
          <TabsContent
            value="kicked"
            className="flex-1 overflow-y-auto px-5 py-4"
          >
            {loadingKicked && (
              <p className="text-sm text-muted-foreground text-center pt-8">
                Loading…
              </p>
            )}
            {!loadingKicked && kickedPlayers?.length === 0 && (
              <div className="flex flex-col items-center gap-2 pt-12 text-muted-foreground">
                <UserX size={32} className="opacity-30" />
                <p className="text-sm">No kicked players</p>
              </div>
            )}
            {!loadingKicked && kickedPlayers && kickedPlayers.length > 0 && (
              <ul className="space-y-2">
                {kickedPlayers.map((p) => (
                  <li
                    key={p.userId}
                    className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                  >
                    <span className="text-sm font-medium">{p.user.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs"
                      onClick={() => handleUnkick(p.userId)}
                    >
                      <RotateCcw size={12} /> Unkick
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        {tab === "settings" && (
          <SheetFooter className="border-t px-5 py-4">
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Settings"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
