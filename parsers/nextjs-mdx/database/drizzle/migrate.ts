import path from "path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { DrizzleDb } from "./connection.ts";

export const runMigrations = (db: DrizzleDb) => {
  migrate(db, {
    migrationsFolder: path.resolve("database/drizzle"),
  });
};
