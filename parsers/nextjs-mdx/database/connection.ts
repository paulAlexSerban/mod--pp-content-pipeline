
import Database from "better-sqlite3";

class DatabaseConnection {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath, { verbose: console.log });
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  getConnection(): Database.Database {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

export { DatabaseConnection };
