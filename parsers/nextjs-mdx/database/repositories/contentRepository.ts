import type { IDatabase } from "../connection.ts";
export interface IContentData {
  slug: string;
  type: string;
  title: string;
  subheading: string;
  excerpt: string;
  author: string;
  date: string;
  status: string;
  pinned: number;
  repo_url: string;
  demo_url: string;
  markdown_content: string;
  full_path: string;
  compiled_content: string;
}

class ContentRepository {
  private db: IDatabase;
  constructor(db: IDatabase) {
    this.db = db;
  }

  insertContent(contentData: IContentData): number | bigint {
    const stmt = this.db.prepare(`
            INSERT INTO content (
                slug, type, title, subheading, excerpt, author, date, 
                status, pinned, repo_url, demo_url, markdown_content, 
                compiled_content, full_path
            ) VALUES (
                @slug, @type, @title, @subheading, @excerpt, @author, @date,
                @status, @pinned, @repo_url, @demo_url, @markdown_content,
                @compiled_content, @full_path
            )
        `);

    const info = stmt.run(contentData);
    return info.lastInsertRowid;
  }

  findBySlug(slug: string): IContentData | undefined {
    return this.db.prepare("SELECT * FROM content WHERE slug = ?").get(slug) as IContentData | undefined;
  }

  findAll(): IContentData[] {
    return this.db.prepare("SELECT * FROM content").all() as IContentData[];
  }

  deleteAll() {
    return this.db.prepare("DELETE FROM content").run();
  }
}

export { ContentRepository };
