import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../lib/db/cosailor.db");

async function main() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec("PRAGMA foreign_keys = ON;");

  const createTableQueries = [
    `CREATE TABLE IF NOT EXISTS sessions (
     id TEXT PRIMARY KEY NOT NULL,
     device_id TEXT NOT NULL,
     ended_at TEXT,
     created_at TEXT,
     last_updated_at TEXT,
     synced INTEGER DEFAULT 0,
     metadata TEXT
   )`,
    `CREATE TABLE IF NOT EXISTS chats (
     id TEXT PRIMARY KEY NOT NULL,
     session_id TEXT NOT NULL,
     created_at TEXT,
     last_updated_at TEXT,
     FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
   )`,
    `CREATE TABLE IF NOT EXISTS messages (
     id TEXT PRIMARY KEY NOT NULL,
     content TEXT,
     chat_id TEXT NOT NULL,
     created_at TEXT,
     role TEXT NOT NULL,
     last_updated_at TEXT,
     FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
   )`,
    `CREATE TABLE IF NOT EXISTS users (
     device_id TEXT PRIMARY KEY NOT NULL
   )`,
  ];

  for (const query of createTableQueries) {
    await db.exec(query);
  }

  console.log("tables were created (or already existed).");
  await db.close();
}

main().catch((err) => {
  console.error("Error creating table:", err);
});
