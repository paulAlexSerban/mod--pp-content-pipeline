import { DatabaseConnection, type IDatabase } from "./database/connection.ts";
import { createDrizzleDb } from "./database/drizzle/connection.ts";
import { runMigrations } from "./database/drizzle/migrate.ts";
// import { ContentRepository } from "./database/repositories/contentRepository.ts";
// import { TagRepository } from "./database/repositories/tagRepository.ts";
// import { FileScanner, type DirectoryPath } from "./utils/fileScanner.ts";
// import { MDXParser } from "./parsers/mdxParser.ts";
// import { FrontmatterExtractor } from "./parsers/frontmatterExtractor.ts";
// import { MigrationService } from "./services/migrationService.ts";

const main = async () => {
  try {
    // initialize database connection
    const dbPath = process.env.DATABASE_PATH || "./database/content.db";
    const dbConnection = new DatabaseConnection(dbPath);
    const db: IDatabase = dbConnection.getConnection();
    const drizzleDb = createDrizzleDb(db);

    // Initialize schema via Drizzle migrations
    runMigrations(drizzleDb);

    // // Initialize repositories
    // const contentRepo = new ContentRepository(drizzleDb);
    // const tagRepo = new TagRepository(drizzleDb);

    // // Initialize services
    // const fileScanner = new FileScanner();
    // const mdxParser = new MDXParser();
    // const frontmatterExtractor = new FrontmatterExtractor();

    // // Create migration service
    // const migrationService = new MigrationService(
    //   fileScanner,
    //   mdxParser,
    //   frontmatterExtractor,
    //   contentRepo,
    //   tagRepo,
    //   db,
    // );

    // // Run migration
    // const contentDir: DirectoryPath = {
    //   baseDir: process.env.CONTENT_DIRECTORY || "./content-source/content",
    // };
    // await migrationService.migrate(contentDir);

    // // Close database connection
    // dbConnection.close();
    // console.log("Database connection closed");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

main();
