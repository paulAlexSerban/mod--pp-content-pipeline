// import type { RunResult } from "better-sqlite3";
// import { eq } from "drizzle-orm";
// import type { DrizzleDb } from "../drizzle/connection.ts";
// import { contentTags, tags } from "../drizzle/schema.ts";

// export interface ITag {
//   id: number | bigint;
//   name: string;
//   slug: string;
// }

// export interface ITagRepository {
//   db: DrizzleDb;
//   insertTag(name: string, slug: string): RunResult;
//   findBySlug(slug: string): ITag | undefined;
//   linkTagToContent(contentId: number | bigint, tagId: number | bigint): RunResult;
//   getTagsForContent(contentId: number | bigint): ITag[];
// }

// export class TagRepository implements ITagRepository {
//   public db: DrizzleDb;
//   constructor(db: DrizzleDb) {
//     this.db = db;
//   }

//   insertTag(name: string, slug: string): RunResult {
//     return this.db
//       .insert(tags)
//       .values({ name, slug })
//       .onConflictDoNothing()
//       .run();
//   }

//   findBySlug(slug: string): ITag | undefined {
//     return this.db
//       .select()
//       .from(tags)
//       .where(eq(tags.slug, slug))
//       .get() as ITag | undefined;
//   }

//   linkTagToContent(contentId: number | bigint, tagId: number | bigint): RunResult {
//     return this.db
//       .insert(contentTags)
//       .values({ contentId: Number(contentId), tagId: Number(tagId) })
//       .onConflictDoNothing()
//       .run();
//   }

//   getTagsForContent(contentId: number | bigint): ITag[] {
//     return this.db
//       .select({ id: tags.id, name: tags.name, slug: tags.slug })
//       .from(tags)
//       .innerJoin(contentTags, eq(tags.id, contentTags.tagId))
//       .where(eq(contentTags.contentId, Number(contentId)))
//       .all() as ITag[];
//   }
// }
