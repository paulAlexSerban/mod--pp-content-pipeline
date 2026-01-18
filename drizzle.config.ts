import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./parsers/nextjs-mdx/database/drizzle/schema.ts",
  out: "./database/drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_PATH ?? "./database/content.db",
  },
} satisfies Config;
