import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/start-server-core'
import { auth } from '../auth'
import { db } from '../db'
import { lobbies } from '../schema'
import type { LobbySettings } from '../types'

export const createLobby = createServerFn({ method: 'POST' })
  .inputValidator((data: LobbySettings) => data)
  .handler(async ({ data }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error('Unauthorized')

    const id = crypto.randomUUID()
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32])
      .join('')

    await db.insert(lobbies).values({
      id,
      code,
      hostId: session.user.id,
      settings: data,
      createdAt: new Date(),
    })

    return { code }
  })
