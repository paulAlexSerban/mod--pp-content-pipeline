import { eq } from "drizzle-orm";
import type { DrizzleDb } from "../drizzle/connection.ts";
import { content } from "../drizzle/schema.ts";
export interface IContentData {
  slug: string;
  type: string;
  title: string;
  // subheading: string;
  // excerpt: string;
  // author: string;
  date: string;
  status: string;
  // pinned: number;
  // repo_url: string;
  // demo_url: string;
  // markdown_content: string;
  // full_path: string;
  // compiled_content: string;
}

class ContentRepository {
  private db: DrizzleDb;
  constructor(db: DrizzleDb) {
    this.db = db;
  }

  insertContent(contentData: IContentData): number | bigint {
    this.db.insert(content).values(contentData).run();
    const record = this.db
      .select({ id: content.id })
      .from(content)
      .where(eq(content.slug, contentData.slug))
      .get();
    return record?.id ?? 0;
  }

  findBySlug(slug: string): IContentData | undefined {
    return this.db
      .select()
      .from(content)
      .where(eq(content.slug, slug))
      .get() as IContentData | undefined;
  }

  findAll(): IContentData[] {
    return this.db.select().from(content).all() as IContentData[];
  }

  deleteAll() {
    return this.db.delete(content).run();
  }
}

export { ContentRepository };
