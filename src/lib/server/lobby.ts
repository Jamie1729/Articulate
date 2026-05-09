import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/start-server-core";
import { eq, and } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { lobbies, lobbyPlayers } from "../schema";
import type { LobbySettings } from "../types";
import { settings } from "node:cluster";

export const createLobby = createServerFn({ method: "POST" })
  .inputValidator((data: LobbySettings) => data)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Unauthorized");

    const id = crypto.randomUUID();
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32])
      .join("");

    await db.insert(lobbies).values({
      id,
      code,
      hostId: session.user.id,
      settings: data,
      createdAt: new Date(),
    });

    return { code };
  });

export const joinAndGetLobby = createServerFn({ method: "POST" })
  .inputValidator((code: string) => code)
  .handler(async ({ data: code }) => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Unauthorized");

    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.code, code),
    });
    if (!lobby) throw new Error("Lobby not found");

    if (lobby.status === "waiting") {
      const existing = await db.query.lobbyPlayers.findFirst({
        where: and(
          eq(lobbyPlayers.lobbyId, lobby.id),
          eq(lobbyPlayers.userId, session.user.id),
        ),
      });

      if (existing?.status === "kicked") {
        throw new Error("You have been kicked from this lobby");
      }

      if (!existing) {
        await db.insert(lobbyPlayers).values({
          id: crypto.randomUUID(),
          lobbyId: lobby.id,
          userId: session.user.id,
          teamNumber: null,
          joinedAt: new Date(),
        });
      }
    }

    const full = await db.query.lobbies.findFirst({
      where: eq(lobbies.code, code),
      with: {
        players: {
          where: eq(lobbyPlayers.status, "active"),
          with: { user: { columns: { id: true, name: true } } },
          orderBy: (p, { asc }) => asc(p.joinedAt),
        },
      },
    });

    return {
      lobby: full!,
      currentUserId: session.user.id,
      hostId: lobby.hostId,
    };
  });

export const setTeam = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; teamNumber: number | null }) => data)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Unauthorized");

    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.code, data.code),
    });
    if (!lobby) throw new Error("Lobby not found");

    await db
      .update(lobbyPlayers)
      .set({ teamNumber: data.teamNumber })
      .where(
        and(
          eq(lobbyPlayers.lobbyId, lobby.id),
          eq(lobbyPlayers.userId, session.user.id),
        ),
      );
  });

export const assignTeam = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { code: string; userId: string; teamNumber: number | null }) => data,
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Unauthorized");

    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.code, data.code),
    });
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.hostId !== session.user.id)
      throw new Error("Only the host can assign teams");

    await db
      .update(lobbyPlayers)
      .set({ teamNumber: data.teamNumber })
      .where(
        and(
          eq(lobbyPlayers.lobbyId, lobby.id),
          eq(lobbyPlayers.userId, data.userId),
        ),
      );
  });

export const kickPlayer = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; userId: string }) => data)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Unauthorized");
    if (session.user.id === data.userId)
      throw new Error("Cannot kick yourself");

    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.code, data.code),
    });
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.hostId !== session.user.id)
      throw new Error("Only the host can kick players");

    await db
      .update(lobbyPlayers)
      .set({ status: "kicked" })
      .where(
        and(
          eq(lobbyPlayers.lobbyId, lobby.id),
          eq(lobbyPlayers.userId, data.userId),
        ),
      );
  });

export const leaveLobby = createServerFn({ method: "POST" })
  .inputValidator((code: string) => code)
  .handler(async ({ data: code }) => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Unauthorized");

    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.code, code),
    });
    if (!lobby) return;

    await db
      .delete(lobbyPlayers)
      .where(
        and(
          eq(lobbyPlayers.lobbyId, lobby.id),
          eq(lobbyPlayers.userId, session.user.id),
        ),
      );
  });

export const updateLobbySettings = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; settings: LobbySettings }) => data)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Unauthorized");

    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.code, data.code),
    });
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.hostId !== session.user.id)
      throw new Error("Only the host can update settings");

    console.log("Updating settings to", data.settings);

    if (data.settings.teamAssignment === "random") {
      console.log("running");
      await db
        .update(lobbyPlayers)
        .set({ teamNumber: null })
        .where(eq(lobbyPlayers.lobbyId, lobby.id));
    }
    await db
      .update(lobbies)
      .set({ settings: data.settings })
      .where(eq(lobbies.code, data.code));
  });

export const getKickedPlayers = createServerFn({ method: "GET" })
  .inputValidator((code: string) => code)
  .handler(async ({ data: code }) => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Unauthorized");

    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.code, code),
    });
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.hostId !== session.user.id)
      throw new Error("Only the host can view kicked players");

    const kicked = await db.query.lobbyPlayers.findMany({
      where: and(
        eq(lobbyPlayers.lobbyId, lobby.id),
        eq(lobbyPlayers.status, "kicked"),
      ),
      with: { user: { columns: { id: true, name: true } } },
    });

    return kicked;
  });

export const unkickPlayer = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; userId: string }) => data)
  .handler(async ({ data }) => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) throw new Error("Unauthorized");

    const lobby = await db.query.lobbies.findFirst({
      where: eq(lobbies.code, data.code),
    });
    if (!lobby) throw new Error("Lobby not found");
    if (lobby.hostId !== session.user.id)
      throw new Error("Only the host can unkick players");

    await db
      .update(lobbyPlayers)
      .set({ status: "active" })
      .where(
        and(
          eq(lobbyPlayers.lobbyId, lobby.id),
          eq(lobbyPlayers.userId, data.userId),
        ),
      );
  });
