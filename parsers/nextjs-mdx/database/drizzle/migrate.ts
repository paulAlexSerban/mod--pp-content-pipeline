import fs from "node:fs";
import path from "path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { readMigrationFiles } from "drizzle-orm/migrator";
import type { DrizzleDb } from "./connection.ts";

export const runMigrations = (db: DrizzleDb) => {
  const migrationsFolder = path.resolve("database/drizzle");
  const journalPath = path.join(migrationsFolder, "meta/_journal.json");

  if (fs.existsSync(journalPath)) {
    const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));
    const migrations = readMigrationFiles({ migrationsFolder });
    const columnsByTable = new Map<string, Set<string>>();
    const ensureMigrationsTable = () => {
      db.$client
        .prepare(
          "CREATE TABLE IF NOT EXISTS \"__drizzle_migrations\" (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)",
        )
        .run();
    };
    const getTableColumns = (tableName: string): Set<string> => {
      const cached = columnsByTable.get(tableName);
      if (cached) return cached;
      const columns = (db.$client
        .prepare(`PRAGMA table_info(${tableName})`)
        .all() as Array<{ name: string }>).map((col) => col.name);
      const set = new Set(columns);
      columnsByTable.set(tableName, set);
      return set;
    };
    const isAddColumnStatement = (statement: string) => {
      const match = statement.match(
        /ALTER\s+TABLE\s+[`"]?(\w+)[`"]?\s+ADD(?:\s+COLUMN)?\s+[`"]?(\w+)[`"]?/i,
      );
      if (!match) return null;
      return { tableName: match[1], columnName: match[2] };
    };

    for (let index = 0; index < (journal.entries?.length ?? 0); index++) {
      const migration = migrations[index];
      if (!migration) continue;

      const statements = migration.sql
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

      const addColumnOps: Array<{ tableName: string; columnName: string }> = [];
      let hasNonAddColumnStatement = false;

      for (const statement of statements) {
        const parsed = isAddColumnStatement(statement);
        if (parsed) {
          addColumnOps.push(parsed);
        } else {
          hasNonAddColumnStatement = true;
          break;
        }
      }

      if (hasNonAddColumnStatement || addColumnOps.length === 0) continue;

      const allColumnsExist = addColumnOps.every(({ tableName, columnName }) =>
        getTableColumns(tableName).has(columnName),
      );

      if (allColumnsExist) {
        ensureMigrationsTable();
        const existing = db.$client
          .prepare(
            "SELECT 1 FROM \"__drizzle_migrations\" WHERE hash = ? LIMIT 1",
          )
          .get(migration.hash);
        if (!existing) {
          db.$client
            .prepare(
              "INSERT INTO \"__drizzle_migrations\" (hash, created_at) VALUES (?, ?)",
            )
            .run(migration.hash, migration.folderMillis);
        }
      }
    }
  }

  migrate(db, { migrationsFolder });
};
