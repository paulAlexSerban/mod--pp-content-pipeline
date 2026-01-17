import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { IDatabase } from "./connection.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Schema {
  constructor(db: IDatabase) {
    this.db = db;
  }

  private db: IDatabase;

  async initialize() {
    const schemaSQL = fs.readFileSync(
      path.join(
        __dirname,
        "../../../database/migrations/001_initial_schema.sql",
      ),
      "utf-8",
    );
    this.db.exec(schemaSQL);
    console.log("Database schema initialized successfully");
  }
}

