import * as SQLITE from "expo-sqlite";
import { createTableQuery } from "./sql/queries";

export class Database {
  private static instance: Database;
  public db: SQLITE.SQLiteDatabase | null = null;
  private readonly dbPath: string;

  private constructor() {
    this.dbPath = "./cosailor.db";
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return this.instance;
  }

  async open() {
    if (this.db) {
      return this.db;
    }

    this.db = await SQLITE.openDatabaseAsync(this.dbPath);
    await this.db.execAsync("PRAGMA foreign_keys = ON");
    await this.db.execAsync(createTableQuery);
  }

  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  async getAllTable() {
    const rows = await this.db?.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;`,
    );
    return rows?.map((r) => r.name);
  }
}
