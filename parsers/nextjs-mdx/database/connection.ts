
import Database from "better-sqlite3";

export interface IDatabase extends Database.Database {}

export class DatabaseConnection {
  private db: IDatabase;

  constructor(dbPath: string) {
    this.db = new Database(dbPath, { verbose: console.log });
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  getConnection(): IDatabase {
    return this.db;
  }

  close() {
    this.db.close();
  }
}
