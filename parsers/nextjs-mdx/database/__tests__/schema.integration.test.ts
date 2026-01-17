import { DatabaseConnection } from "../connection";
import { Schema } from "../schema";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("Schema Integration Tests", () => {
  let testDbPath: string;
  let dbConnection: DatabaseConnection;

  beforeEach(() => {
    testDbPath = join(tmpdir(), `test-schema-${Date.now()}-${Math.random()}.sqlite`);
    dbConnection = new DatabaseConnection(testDbPath);
  });

  afterEach(() => {
    dbConnection.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    ["-wal", "-shm"].forEach((suffix) => {
      const file = testDbPath + suffix;
      if (existsSync(file)) {
        unlinkSync(file);
      }
    });
  });

  describe("Database Schema Initialization", () => {
    test("should create all required tables", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      await schema.initialize();

      // Query sqlite_master to verify tables were created
      const tables = db
        .prepare(
          `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
        )
        .all() as Array<{ name: string }>;

      const tableNames = tables.map((t) => t.name);
      
      expect(tableNames).toContain("content");
      expect(tableNames).toContain("tags");
      expect(tableNames).toContain("content_tags");
      expect(tableNames).toContain("categories");
      expect(tableNames).toContain("content_categories");
    });

    test("should create content table with correct columns", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      await schema.initialize();

      const columns = db
        .prepare(`PRAGMA table_info(content)`)
        .all() as Array<{ name: string; type: string; notnull: number; dflt_value: any }>;

      const columnNames = columns.map((c) => c.name);
      
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("slug");
      expect(columnNames).toContain("type");
      expect(columnNames).toContain("title");
      expect(columnNames).toContain("markdown_content");
      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("updated_at");

      // Verify specific column properties
      const slugColumn = columns.find((c) => c.name === "slug");
      expect(slugColumn?.notnull).toBe(1); // NOT NULL constraint
    });

    test("should create indexes for performance", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      await schema.initialize();

      const indexes = db
        .prepare(
          `SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name`
        )
        .all() as Array<{ name: string }>;

      const indexNames = indexes.map((i) => i.name);
      
      expect(indexNames).toContain("idx_content_type");
      expect(indexNames).toContain("idx_content_status");
      expect(indexNames).toContain("idx_content_date");
      expect(indexNames).toContain("idx_content_slug");
      expect(indexNames).toContain("idx_tags_slug");
    });

    test("should enforce foreign key constraints in junction tables", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      await schema.initialize();

      // Get foreign key info for content_tags table
      const foreignKeys = db
        .prepare(`PRAGMA foreign_key_list(content_tags)`)
        .all() as Array<{ table: string; from: string; to: string }>;

      expect(foreignKeys.length).toBeGreaterThan(0);
      
      const tables = foreignKeys.map((fk) => fk.table);
      expect(tables).toContain("content");
      expect(tables).toContain("tags");
    });

    test("should allow idempotent initialization (running multiple times)", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      // Initialize schema multiple times
      await schema.initialize();
      await schema.initialize();
      await schema.initialize();

      // Should still have correct tables without errors
      const tables = db
        .prepare(
          `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
        )
        .all() as Array<{ name: string }>;

      expect(tables.length).toBe(5); // content, tags, content_tags, categories, content_categories
    });

    test("should create content table with UNIQUE constraint on slug", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      await schema.initialize();

      // Insert a record
      db.prepare(
        `INSERT INTO content (slug, type, title, markdown_content) VALUES (?, ?, ?, ?)`
      ).run("test-slug", "post", "Test Title", "Test content");

      // Try to insert duplicate slug - should throw
      expect(() => {
        db.prepare(
          `INSERT INTO content (slug, type, title, markdown_content) VALUES (?, ?, ?, ?)`
        ).run("test-slug", "post", "Another Title", "More content");
      }).toThrow();
    });

    test("should cascade delete content_tags when content is deleted", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      await schema.initialize();

      // Insert content and tag
      const contentResult = db
        .prepare(
          `INSERT INTO content (slug, type, title, markdown_content) VALUES (?, ?, ?, ?)`
        )
        .run("test-post", "post", "Test", "Content");
      
      const tagResult = db
        .prepare(`INSERT INTO tags (name, slug) VALUES (?, ?)`)
        .run("JavaScript", "javascript");

      // Link them
      db.prepare(`INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)`)
        .run(contentResult.lastInsertRowid, tagResult.lastInsertRowid);

      // Verify link exists
      let links = db.prepare(`SELECT * FROM content_tags`).all();
      expect(links.length).toBe(1);

      // Delete content
      db.prepare(`DELETE FROM content WHERE id = ?`).run(contentResult.lastInsertRowid);

      // Verify link was cascade deleted
      links = db.prepare(`SELECT * FROM content_tags`).all();
      expect(links.length).toBe(0);
    });

    test("should have default values for status and pinned columns", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      await schema.initialize();

      // Insert minimal content without status or pinned
      const result = db
        .prepare(
          `INSERT INTO content (slug, type, title, markdown_content) VALUES (?, ?, ?, ?)`
        )
        .run("test-defaults", "post", "Test", "Content");

      const row = db
        .prepare(`SELECT status, pinned FROM content WHERE id = ?`)
        .get(result.lastInsertRowid) as any;

      expect(row.status).toBe("draft");
      expect(row.pinned).toBe(0);
    });

    test("should store timestamps automatically", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      await schema.initialize();

      const result = db
        .prepare(
          `INSERT INTO content (slug, type, title, markdown_content) VALUES (?, ?, ?, ?)`
        )
        .run("test-timestamps", "post", "Test", "Content");

      const row = db
        .prepare(`SELECT created_at, updated_at FROM content WHERE id = ?`)
        .get(result.lastInsertRowid) as any;

      expect(row.created_at).toBeTruthy();
      expect(row.updated_at).toBeTruthy();
      // Timestamps should be ISO format-ish
      expect(row.created_at).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });
  });

  describe("Real-World Usage Scenarios", () => {
    test("should support a complete content lifecycle", async () => {
      const db = dbConnection.getConnection();
      const schema = new Schema(db);
      
      await schema.initialize();

      // Create tags
      const jsTag = db
        .prepare(`INSERT INTO tags (name, slug) VALUES (?, ?)`)
        .run("JavaScript", "javascript");
      
      const tsTag = db
        .prepare(`INSERT INTO tags (name, slug) VALUES (?, ?)`)
        .run("TypeScript", "typescript");

      // Create category
      const webDevCategory = db
        .prepare(`INSERT INTO categories (name, slug) VALUES (?, ?)`)
        .run("Web Development", "web-development");

      // Create content
      const content = db
        .prepare(
          `INSERT INTO content (slug, type, title, markdown_content, status, date) 
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(
          "my-first-post",
          "post",
          "My First Post",
          "# Hello World",
          "published",
          "2026-01-17"
        );

      // Link content to tags
      db.prepare(`INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)`)
        .run(content.lastInsertRowid, jsTag.lastInsertRowid);
      
      db.prepare(`INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)`)
        .run(content.lastInsertRowid, tsTag.lastInsertRowid);

      // Link content to category
      db.prepare(`INSERT INTO content_categories (content_id, category_id) VALUES (?, ?)`)
        .run(content.lastInsertRowid, webDevCategory.lastInsertRowid);

      // Query content with tags
      const result = db
        .prepare(
          `
          SELECT c.*, GROUP_CONCAT(t.name) as tag_names
          FROM content c
          LEFT JOIN content_tags ct ON c.id = ct.content_id
          LEFT JOIN tags t ON ct.tag_id = t.id
          WHERE c.slug = ?
          GROUP BY c.id
        `
        )
        .get("my-first-post") as any;

      expect(result.title).toBe("My First Post");
      expect(result.tag_names).toContain("JavaScript");
      expect(result.tag_names).toContain("TypeScript");
    });
  });
});
