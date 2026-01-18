import { DatabaseConnection, type IDatabase } from "./database/connection.ts";
import { Schema } from "./database/schema.ts";
import { ContentRepository } from "./database/repositories/contentRepository.ts";
import { TagRepository } from "./database/repositories/tagRepository.ts";
import { FileScanner, type DirectoryPath } from "./utils/fileScanner.ts";
import { MDXParser } from "./parsers/mdxParser.ts";
import { FrontmatterExtractor } from "./parsers/frontmatterExtractor.ts";
import { MigrationService } from "./services/migrationService.ts";

const main = async () => {
  try {
    // initialize database connection
    const dbPath = process.env.DATABASE_PATH || "./database/content.db";
    const dbConnection = new DatabaseConnection(dbPath);
    const db: IDatabase = dbConnection.getConnection();

    // Initialize schema
    const schema = new Schema(db);
    await schema.initialize();

    // Initialize repositories
    const contentRepo = new ContentRepository(db);
    const tagRepo = new TagRepository(db);

    // Initialize services
    const fileScanner = new FileScanner();
    const mdxParser = new MDXParser();
    const frontmatterExtractor = new FrontmatterExtractor();

    // Create migration service
    const migrationService = new MigrationService(
      fileScanner,
      mdxParser,
      frontmatterExtractor,
      contentRepo,
      tagRepo,
      db,
    );

    // Run migration
    const contentDir: DirectoryPath = {
      baseDir: process.env.CONTENT_DIRECTORY || "./content-source/content",
    };
    await migrationService.migrate(contentDir);

    // Close database connection
    dbConnection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

main();
