import fs from "fs";
import path from "path";
import type { IDatabase } from "./connection.ts";

export class Schema {
  constructor(db: IDatabase) {
    this.db = db;
  }

  private db: IDatabase;

  async initialize() {
    const schemaSQL = fs.readFileSync(
      path.resolve("database/migrations/001_initial_schema.sql"),
      "utf-8",
    );
    this.db.exec(schemaSQL);
    console.log("Database schema initialized successfully");
  }
}

