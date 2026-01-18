import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const content = sqliteTable(
  "content",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    date: text("date"),
    status: text("status").default("draft"),
    // created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    // updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
    // subheading: text("subheading"),
    // excerpt: text("excerpt"),
    // author: text("author"),
    // pinned: integer("pinned").default(0),
    // repo_url: text("repo_url"),
    // demo_url: text("demo_url"),
    // markdown_content: text("markdown_content").notNull(),
    // compiled_content: text("compiled_content"),
    // full_path: text("full_path"),

  },
  // (table) => ({
  //   typeIdx: index("idx_content_type").on(table.type),
  //   statusIdx: index("idx_content_status").on(table.status),
  //   dateIdx: index("idx_content_date").on(table.date),
  //   slugIdx: index("idx_content_slug").on(table.slug),
  // }),
);

// export const tags = sqliteTable(
//   "tags",
//   {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     name: text("name").notNull().unique(),
//     slug: text("slug").notNull().unique(),
//     created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
//   },
//   (table) => ({
//     slugIdx: index("idx_tags_slug").on(table.slug),
//   }),
// );

// export const contentTags = sqliteTable(
//   "content_tags",
//   {
//     contentId: integer("content_id")
//       .notNull()
//       .references(() => content.id, { onDelete: "cascade" }),
//     tagId: integer("tag_id")
//       .notNull()
//       .references(() => tags.id, { onDelete: "cascade" }),
//   },
//   (table) => ({
//     pk: primaryKey({ columns: [table.contentId, table.tagId] }),
//   }),
// );

export type ContentRecord = typeof content.$inferSelect;
export type NewContentRecord = typeof content.$inferInsert;
// export type TagRecord = typeof tags.$inferSelect;
