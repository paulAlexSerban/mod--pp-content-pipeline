import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { IDatabase } from "../connection.ts";
import * as schema from "./schema.ts";

export type DrizzleDb = BetterSQLite3Database<typeof schema> & {
  $client: IDatabase;
};

export const createDrizzleDb = (db: IDatabase): DrizzleDb => {
  return drizzle(db, { schema });
};
