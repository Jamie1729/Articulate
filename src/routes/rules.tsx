import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/rules')({
  component: RulesPage,
})

const categories = [
  { name: 'Object', description: 'Describe a physical thing — anything you can touch or see.' },
  { name: 'Nature', description: 'Animals, plants, weather, geography — the natural world.' },
  { name: 'Random', description: 'Could be anything. Stay sharp.' },
  { name: 'Person', description: 'Real or fictional — describe the person without saying their name.' },
  { name: 'Action', description: 'A verb or activity — describe what someone does.' },
  { name: 'World', description: 'Countries, cities, landmarks — places on the map.' },
]

function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">

        <div className="space-y-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
              ← Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">How to Play</h1>
          <p className="text-muted-foreground text-lg">
            Articulate is a fast-talking team game. Describe as many words as possible before the timer runs out.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">The Basics</h2>
          <ol className="space-y-3 text-sm leading-relaxed list-none">
            {[
              'Split into two or more teams. The more players the better.',
              'One player describes — the rest of the team guesses.',
              'The describer draws a card and has 30 seconds to get their team to say as many words as possible.',
              'You cannot say the word itself, any part of it, or rhyme with it.',
              'For each correct guess your team moves forward one space on the board.',
              'The first team to reach the end wins.',
            ].map((rule, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-muted-foreground font-mono w-5 shrink-0">{i + 1}.</span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <Card key={cat.name}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-base">{cat.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Things you cannot do</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Say the word or any part of it</li>
            <li>Rhyme with the word ("sounds like…")</li>
            <li>Spell out the word</li>
            <li>Use gestures — words only</li>
            <li>Pass on a card</li>
          </ul>
        </div>

        <Link to="/login" search={{ redirect: '/lobby' }}>
          <Button size="lg">Play Now</Button>
        </Link>

      </div>
    </div>
  )
}
