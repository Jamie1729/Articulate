import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { createLobby } from "@/lib/server/lobby";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authed/lobby/create")({
  validateSearch: () => ({}),
  component: CreateLobbyPage,
});

const CATEGORIES = [
  "Object",
  "Nature",
  "Random",
  "Person",
  "Action",
  "World",
] as const;

const DEFAULTS = {
  numTeams: "2",
  teamAssignment: "random" as "random" | "host" | "self",
  minPlayersPerTeam: 2,
  maxPlayersPerTeam: 8,
  roundDuration: 30,
  numSkips: "0",
  skipBehaviour: "back" as "back" | "discard",
  winCondition: "board" as "board" | "rounds",
  boardSize: 40,
  numRounds: 5,
  categories: {
    Object: true,
    Nature: true,
    Random: true,
    Person: true,
    Action: true,
    World: true,
  },
  customWords: "",
  allowDuplicates: false,
};

function CreateLobbyPage() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: DEFAULTS,
    onSubmit: async ({ value }) => {
      const { code } = await createLobby({ data: value });
      navigate({ to: "/lobby/$lobbyId", params: { lobbyId: code } });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create Lobby</h1>
          <p className="text-muted-foreground mt-1">
            Configure your game settings
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* ── Teams ── */}
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                Set up how players are divided into teams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form.Field name="numTeams">
                {(field) => (
                  <Field>
                    <FieldLabel>Number of teams</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => val && field.handleChange(val)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Field name="teamAssignment">
                {(field) => (
                  <Field>
                    <FieldLabel>Team assignment</FieldLabel>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      className="mt-2 space-y-2"
                    >
                      {[
                        {
                          value: "random",
                          label: "Random",
                          description:
                            "Players are shuffled into teams automatically",
                        },
                        {
                          value: "host",
                          label: "Host assigns",
                          description: "Host places each player into a team",
                        },
                        {
                          value: "self",
                          label: "Self-select",
                          description: "Players choose their own team",
                        },
                      ].map((opt) => (
                        <div key={opt.value} className="flex items-start gap-2">
                          <RadioGroupItem
                            value={opt.value}
                            id={`assign-${opt.value}`}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={`assign-${opt.value}`}
                            className="font-normal cursor-pointer"
                          >
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              — {opt.description}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </Field>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="minPlayersPerTeam">
                  {(field) => (
                    <Field>
                      <FieldLabel>Min players per team</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="maxPlayersPerTeam">
                  {(field) => (
                    <Field>
                      <FieldLabel>Max players per team</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
            </CardContent>
          </Card>

          {/* ── Turns ── */}
          <Card>
            <CardHeader>
              <CardTitle>Turns</CardTitle>
              <CardDescription>Control the pace of each round</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form.Field name="roundDuration">
                {(field) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel>Round duration</FieldLabel>
                      <span className="text-sm font-medium tabular-nums">
                        {field.state.value}s
                      </span>
                    </div>
                    <Slider
                      value={[field.state.value]}
                      onValueChange={(values) => field.handleChange(values[0])}
                      min={15}
                      max={120}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>15s</span>
                      <span>120s</span>
                    </div>
                  </Field>
                )}
              </form.Field>

              <form.Field name="numSkips">
                {(field) => (
                  <Field>
                    <FieldLabel>Skips per round</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => val && field.handleChange(val)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n === 0 ? "None" : n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Subscribe selector={(s) => s.values.numSkips}>
                {(numSkips) =>
                  numSkips !== "0" && (
                    <form.Field name="skipBehaviour">
                      {(field) => (
                        <Field>
                          <FieldLabel>Skipped cards</FieldLabel>
                          <RadioGroup
                            value={field.state.value}
                            onValueChange={field.handleChange}
                            className="mt-2 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="back" id="skip-back" />
                              <Label
                                htmlFor="skip-back"
                                className="font-normal cursor-pointer"
                              >
                                Return to deck
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                value="discard"
                                id="skip-discard"
                              />
                              <Label
                                htmlFor="skip-discard"
                                className="font-normal cursor-pointer"
                              >
                                Discard
                              </Label>
                            </div>
                          </RadioGroup>
                        </Field>
                      )}
                    </form.Field>
                  )
                }
              </form.Subscribe>
            </CardContent>
          </Card>

          {/* ── Winning condition ── */}
          <Card>
            <CardHeader>
              <CardTitle>Winning condition</CardTitle>
              <CardDescription>Decide how the game ends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form.Field name="winCondition">
                {(field) => (
                  <Field>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      className="space-y-2"
                    >
                      {[
                        {
                          value: "board",
                          label: "Classic board",
                          description:
                            "First team to reach the end of the board wins",
                        },
                        {
                          value: "rounds",
                          label: "Fixed rounds",
                          description:
                            "Most points after a set number of rounds",
                        },
                      ].map((opt) => (
                        <div key={opt.value} className="flex items-start gap-2">
                          <RadioGroupItem
                            value={opt.value}
                            id={`win-${opt.value}`}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={`win-${opt.value}`}
                            className="font-normal cursor-pointer"
                          >
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              — {opt.description}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </Field>
                )}
              </form.Field>

              <form.Subscribe selector={(s) => s.values.winCondition}>
                {(winCondition) => (
                  <>
                    {winCondition === "board" && (
                      <form.Field name="boardSize">
                        {(field) => (
                          <Field>
                            <div className="flex items-center justify-between">
                              <FieldLabel>Board size</FieldLabel>
                              <span className="text-sm font-medium tabular-nums">
                                {field.state.value} spaces
                              </span>
                            </div>
                            <Slider
                              value={[field.state.value]}
                              onValueChange={(values) =>
                                field.handleChange(values[0])
                              }
                              min={20}
                              max={80}
                              step={5}
                              className="mt-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>20</span>
                              <span>80</span>
                            </div>
                          </Field>
                        )}
                      </form.Field>
                    )}
                    {winCondition === "rounds" && (
                      <form.Field name="numRounds">
                        {(field) => (
                          <Field>
                            <FieldLabel>Number of rounds</FieldLabel>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(Number(e.target.value))
                              }
                              className="w-32"
                            />
                          </Field>
                        )}
                      </form.Field>
                    )}
                  </>
                )}
              </form.Subscribe>
            </CardContent>
          </Card>

          {/* ── Cards ── */}
          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>
                Choose which categories to include and add your own words
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Field>
                <FieldLabel>Categories</FieldLabel>
                <FieldDescription>
                  At least one must be enabled
                </FieldDescription>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <form.Field key={category} name={`categories.${category}`}>
                      {(field) => (
                        <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                          <Label
                            htmlFor={`cat-${category}`}
                            className="cursor-pointer"
                          >
                            {category}
                          </Label>
                          <Switch
                            id={`cat-${category}`}
                            checked={field.state.value as boolean}
                            onCheckedChange={field.handleChange}
                          />
                        </div>
                      )}
                    </form.Field>
                  ))}
                </div>
              </Field>

              <form.Field name="allowDuplicates">
                {(field) => (
                  <div className="flex items-center justify-between rounded-lg border px-3 py-3">
                    <div>
                      <Label
                        htmlFor="allow-duplicates"
                        className="cursor-pointer"
                      >
                        Allow duplicate cards
                      </Label>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        The same word may appear more than once per session
                      </p>
                    </div>
                    <Switch
                      id="allow-duplicates"
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="customWords">
                {(field) => (
                  <Field>
                    <FieldLabel>Custom words</FieldLabel>
                    <FieldDescription>
                      One word or phrase per line — added to the deck alongside
                      standard cards
                    </FieldDescription>
                    <Textarea
                      placeholder={
                        "Quantum entanglement\nSteve Irwin\nThe Eiffel Tower"
                      }
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={5}
                      className="mt-1 font-mono text-sm"
                    />
                  </Field>
                )}
              </form.Field>
            </CardContent>
          </Card>

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating lobby…" : "Create Lobby"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
