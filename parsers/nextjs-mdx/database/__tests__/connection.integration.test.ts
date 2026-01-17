import { DatabaseConnection } from "../connection";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("DatabaseConnection Integration Tests", () => {
  let testDbPath: string;

  beforeEach(() => {
    // Create a unique test database path for each test
    testDbPath = join(tmpdir(), `test-db-${Date.now()}-${Math.random()}.sqlite`);
  });

  afterEach(() => {
    // Clean up test database files
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    // Also clean up WAL and SHM files
    ["-wal", "-shm"].forEach((suffix) => {
      const file = testDbPath + suffix;
      if (existsSync(file)) {
        unlinkSync(file);
      }
    });
  });

  describe("Database Creation and Connection", () => {
    test("should create a new database file if it doesn't exist", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      
      expect(existsSync(testDbPath)).toBe(true);
      
      dbConnection.close();
    });

    test("should establish a connection and return a usable database instance", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      const db = dbConnection.getConnection();
      
      expect(db).toBeDefined();
      expect(typeof db.prepare).toBe("function");
      
      dbConnection.close();
    });

    test("should enable WAL mode", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      const db = dbConnection.getConnection();
      
      const journalMode = db.pragma("journal_mode", { simple: true });
      
      expect(journalMode).toBe("wal");
      
      dbConnection.close();
    });

    test("should enable foreign keys", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      const db = dbConnection.getConnection();
      
      const foreignKeys = db.pragma("foreign_keys", { simple: true });
      
      expect(foreignKeys).toBe(1);
      
      dbConnection.close();
    });
  });

  describe("Database Operations", () => {
    test("should allow executing basic SQL queries", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      const db = dbConnection.getConnection();
      
      db.exec(`
        CREATE TABLE test_table (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL
        )
      `);
      
      const insert = db.prepare("INSERT INTO test_table (name) VALUES (?)");
      const result = insert.run("Test Name");
      
      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeDefined();
      
      const select = db.prepare("SELECT * FROM test_table WHERE id = ?");
      const row = select.get(result.lastInsertRowid) as any;
      
      expect(row.name).toBe("Test Name");
      
      dbConnection.close();
    });

    test("should enforce foreign key constraints", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      const db = dbConnection.getConnection();
      
      db.exec(`
        CREATE TABLE parent (
          id INTEGER PRIMARY KEY
        );
        
        CREATE TABLE child (
          id INTEGER PRIMARY KEY,
          parent_id INTEGER NOT NULL,
          FOREIGN KEY (parent_id) REFERENCES parent(id)
        );
      `);
      
      const insertChild = db.prepare("INSERT INTO child (parent_id) VALUES (?)");
      
      // Should throw because parent with id=999 doesn't exist
      expect(() => insertChild.run(999)).toThrow();
      
      dbConnection.close();
    });

    test("should handle transactions correctly", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      const db = dbConnection.getConnection();
      
      db.exec(`CREATE TABLE test_table (id INTEGER PRIMARY KEY, value INTEGER)`);
      
      const insert = db.prepare("INSERT INTO test_table (value) VALUES (?)");
      
      // Transaction that commits
      const insertMany = db.transaction((values: number[]) => {
        for (const value of values) {
          insert.run(value);
        }
      });
      
      insertMany([1, 2, 3]);
      
      const count = db.prepare("SELECT COUNT(*) as count FROM test_table").get() as any;
      expect(count.count).toBe(3);
      
      dbConnection.close();
    });
  });

  describe("Connection Lifecycle", () => {
    test("should close connection without errors", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      
      expect(() => dbConnection.close()).not.toThrow();
    });

    test("should not allow operations after closing", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      const db = dbConnection.getConnection();
      
      dbConnection.close();
      
      // Attempting operations after close should throw
      expect(() => db.prepare("SELECT 1")).toThrow();
    });

    test("should be able to reopen a closed database", () => {
      const dbConnection1 = new DatabaseConnection(testDbPath);
      const db1 = dbConnection1.getConnection();
      
      db1.exec(`CREATE TABLE test_table (id INTEGER PRIMARY KEY)`);
      db1.prepare("INSERT INTO test_table (id) VALUES (?)").run(1);
      
      dbConnection1.close();
      
      // Reopen the same database
      const dbConnection2 = new DatabaseConnection(testDbPath);
      const db2 = dbConnection2.getConnection();
      
      const row = db2.prepare("SELECT * FROM test_table WHERE id = 1").get();
      expect(row).toBeDefined();
      
      dbConnection2.close();
    });
  });

  describe("Error Handling", () => {
    test("should throw error for invalid database path", () => {
      const invalidPath = "/invalid/path/that/does/not/exist/test.db";
      
      expect(() => new DatabaseConnection(invalidPath)).toThrow();
    });

    test("should handle invalid SQL gracefully", () => {
      const dbConnection = new DatabaseConnection(testDbPath);
      const db = dbConnection.getConnection();
      
      expect(() => db.exec("INVALID SQL STATEMENT")).toThrow();
      
      dbConnection.close();
    });
  });

  describe("In-Memory Database", () => {
    test("should work with in-memory database", () => {
      const dbConnection = new DatabaseConnection(":memory:");
      const db = dbConnection.getConnection();
      
      db.exec(`CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)`);
      db.prepare("INSERT INTO test_table (name) VALUES (?)").run("Test");
      
      const row = db.prepare("SELECT * FROM test_table").get() as any;
      expect(row.name).toBe("Test");
      
      dbConnection.close();
    });
  });
});
