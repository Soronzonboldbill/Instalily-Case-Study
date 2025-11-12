export const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      device_id TEXT NOT NULL,
      ended_at TEXT,
      created_at TEXT,
      last_updated_at TEXT,
      synced INTEGER DEFAULT 0,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY NOT NULL,
      session_id TEXT NOT NULL,
      created_at TEXT,
      last_updated_at TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      role TEXT NOT NULL,
      content TEXT,
      chat_id TEXT NOT NULL,
      created_at TEXT,
      last_updated_at TEXT,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS userRow (
      device_id TEXT PRIMARY KEY NOT NULL
    );
  `;
