
import Database from "better-sqlite3";

export interface IDatabase extends Database.Database {}

export class DatabaseConnection {
  private db: IDatabase;

  constructor(dbPath: string) {
    this.db = new Database(dbPath, { verbose: console.log });
    // Enable WAL mode and foreign key constraints
    // WAL mode improves concurrency and performance by allowing simultaneous reads and writes
    // Foreign key constraints ensure referential integrity between tables
    this.db.pragma("journal_mode = WAL");
    // Enable foreign key constraints
    this.db.pragma("foreign_keys = ON");
  }

  getConnection(): IDatabase {
    return this.db;
  }

  close() {
    this.db.close();
  }
}
