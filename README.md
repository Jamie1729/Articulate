# Articulate

A web-based recreation of the Articulate board game. Players log in, create or join a lobby, and play together in the same room.

## Tech Stack

- **Framework** — TanStack Start (React, SSR)
- **Auth** — BetterAuth
- **Database** — Supabase Postgres + Drizzle ORM
- **UI** — shadcn/ui + Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Supabase project

### Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/Jamie1729/articulate
   cd articulate
   pnpm install
   ```

2. Copy the environment variables and fill them in:

   ```bash
   cp .env.example .env
   ```

   | Variable | Where to find it |
   |---|---|
   | `DATABASE_URL` | Supabase → Project Settings → Database → Session Pooler URI |
   | `BETTER_AUTH_SECRET` | Run `openssl rand -base64 32` |
   | `BETTER_AUTH_URL` | `http://localhost:3000` for local dev |

3. Push the schema to your database:

   ```bash
   pnpm db:push
   ```

4. Start the dev server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## How to Play

See the in-app [rules page](http://localhost:3000/rules) or the real Articulate board game instructions.
