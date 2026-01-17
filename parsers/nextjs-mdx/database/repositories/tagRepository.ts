
import type { IDatabase } from "../connection.ts";

export class TagRepository {
      private db: IDatabase;
  constructor(db: IDatabase) {
    this.db = db;
  }



    insertTag(name: string, slug: string) {
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)
        `);
        return stmt.run(name, slug);
    }

    findBySlug(slug: string) {
        return this.db.prepare('SELECT * FROM tags WHERE slug = ?').get(slug);
    }

    linkTagToContent(contentId: number | bigint, tagId: number | bigint) {
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO content_tags (content_id, tag_id) VALUES (?, ?)
        `);
        return stmt.run(contentId, tagId);
    }

    getTagsForContent(contentId: number | bigint) {
        return this.db.prepare(`
            SELECT t.* FROM tags t
            INNER JOIN content_tags ct ON t.id = ct.tag_id
            WHERE ct.content_id = ?
        `).all(contentId);
    }
}
