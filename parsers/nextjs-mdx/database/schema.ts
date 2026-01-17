import fs from "fs";
import path from "path";
import { IDatabase } from "./connection";

class Schema {
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

export { Schema };
