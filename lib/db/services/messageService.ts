import type { Database } from "../db";
import type { Chat, Message } from "@/lib/types/Chat";
import * as CRYPTO from "expo-crypto";

export async function createMsg(
  db: Database,
  chatID: string,
  msg: Message,
): Promise<string> {
  const msgID = CRYPTO.randomUUID();
  await db.db?.runAsync(
    "INSERT INTO messages (id, chat_id, role, content, created_at) values (?, ?, ?, ?, ?)",
    [msgID, chatID, msg.role, msg.value, new Date().toString()],
  );
  return msgID;
}

export async function fetchAllMsgsFromChat(
  db: Database,
  chatID: string,
): Promise<Message[]> {
  const rows =
    (await db.db?.getAllAsync<{
      id: string;
      role: string;
      content: string;
      chat_id: string;
      created_at: string;
    }>("SELECT * FROM messages WHERE chat_id = ?", [chatID])) ?? [];

  const msgs: Message[] = rows.map((row) => ({
    role: row.role === "human" ? "human" : "ai",
    value: row.content,
  }));

  return msgs;
}
