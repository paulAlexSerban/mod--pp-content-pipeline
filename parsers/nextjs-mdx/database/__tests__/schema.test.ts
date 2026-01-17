import { Schema } from "../schema";
import { IDatabase } from "../connection";
import * as fs from "fs";

// Mock the file system
jest.mock("fs");
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("Schema Unit Tests", () => {
  let mockDb: Partial<IDatabase>;

  beforeEach(() => {
    mockDb = {
      exec: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("initialize", () => {
    test("should read the SQL migration file from the correct path", async () => {
      const mockSQL = "CREATE TABLE test (id INTEGER);";
      mockedFs.readFileSync.mockReturnValue(mockSQL);

      const schema = new Schema(mockDb as IDatabase);
      await schema.initialize();

      expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
      const callArgs = mockedFs.readFileSync.mock.calls[0];
      expect(callArgs[0]).toContain("001_initial_schema.sql");
      expect(callArgs[1]).toBe("utf-8");
    });

    test("should execute the SQL from the migration file", async () => {
      const mockSQL = "CREATE TABLE test (id INTEGER);";
      mockedFs.readFileSync.mockReturnValue(mockSQL);

      const schema = new Schema(mockDb as IDatabase);
      await schema.initialize();

      expect(mockDb.exec).toHaveBeenCalledTimes(1);
      expect(mockDb.exec).toHaveBeenCalledWith(mockSQL);
    });

    test("should throw error if SQL file cannot be read", async () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error("File not found");
      });

      const schema = new Schema(mockDb as IDatabase);

      await expect(schema.initialize()).rejects.toThrow("File not found");
      expect(mockDb.exec).not.toHaveBeenCalled();
    });

    test("should throw error if database exec fails", async () => {
      const mockSQL = "CREATE TABLE test (id INTEGER);";
      mockedFs.readFileSync.mockReturnValue(mockSQL);
      (mockDb.exec as jest.Mock).mockImplementation(() => {
        throw new Error("SQL syntax error");
      });

      const schema = new Schema(mockDb as IDatabase);

      await expect(schema.initialize()).rejects.toThrow("SQL syntax error");
    });
  });
});
