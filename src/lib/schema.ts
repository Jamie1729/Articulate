import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core'

// BetterAuth required tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// Game tables
export const lobbies = pgTable('lobbies', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  hostId: text('host_id')
    .notNull()
    .references(() => user.id),
  status: text('status').notNull().default('waiting'), // waiting | playing | finished
  createdAt: timestamp('created_at').notNull(),
})

export const lobbyPlayers = pgTable('lobby_players', {
  id: text('id').primaryKey(),
  lobbyId: text('lobby_id')
    .notNull()
    .references(() => lobbies.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  teamNumber: integer('team_number').notNull(),
  joinedAt: timestamp('joined_at').notNull(),
})

export const games = pgTable('games', {
  id: text('id').primaryKey(),
  lobbyId: text('lobby_id')
    .notNull()
    .references(() => lobbies.id),
  currentTeam: integer('current_team').notNull().default(0),
  boardPositions: jsonb('board_positions').notNull().default([]),
  status: text('status').notNull().default('active'), // active | finished
  createdAt: timestamp('created_at').notNull(),
})

export const cards = pgTable('cards', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // Object | Nature | Random | Person | Action | World
  word: text('word').notNull(),
})
