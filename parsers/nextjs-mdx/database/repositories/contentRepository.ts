import { IDatabase } from "../connection";
interface ContentData {
  slug: string;
  type: string;
  title: string;
  subheading: string;
  excerpt: string;
}

class ContentRepository {
  private db: IDatabase;
  constructor(db: IDatabase) {
    this.db = db;
  }

  insertContent(contentData: ContentData): number | bigint {
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

  findBySlug(slug: string): ContentData | undefined {
    return this.db.prepare("SELECT * FROM content WHERE slug = ?").get(slug) as ContentData | undefined;
  }

  findAll(): ContentData[] {
    return this.db.prepare("SELECT * FROM content").all() as ContentData[];
  }

  deleteAll() {
    return this.db.prepare("DELETE FROM content").run();
  }
}

export { ContentRepository };
