import type { Database } from "../db";
import type { Chat, Message } from "@/lib/types/Chat";
import * as CRYPTO from "expo-crypto";

export async function createChat(
  db: Database,
  sessionID: string,
): Promise<Chat> {
  const id = CRYPTO.randomUUID();

  await db.db?.runAsync(
    `INSERT INTO chats (id, session_id, created_at) values (?, ?, ?)`,
    [id, sessionID, new Date().toString()],
  );
  return { id, msgs: [] };
}
