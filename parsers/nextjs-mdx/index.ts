import { DatabaseConnection, type IDatabase } from "./database/connection.ts";
import { Schema } from "./database/schema.ts";
import { ContentRepository } from "./database/repositories/contentRepository.ts";
import { TagRepository } from "./database/repositories/tagRepository.ts";
import { FileScanner, type DirectoryPath } from "./utils/fileScanner.ts";
import { MDXParser } from "./parsers/mdxParser.ts";
import { FrontmatterExtractor } from "./parsers/frontmatterExtractor.ts";
import { MigrationService } from "./services/migrationService.ts";

// export async function parseMdxFile(filePath: string): Promise<string> {
//   try {
//     const absolutePath = path.resolve(filePath);
//     const fileContent = await fsPromises.readFile(absolutePath, "utf-8");
//     // Here you can add additional MDX parsing logic if needed
//     return fileContent;
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     throw new Error(`Failed to read MDX file at ${filePath}: ${errorMessage}`);
//   }
// }

// export async function listMdxFiles(directoryPath: string): Promise<string[]> {
//   try {
//     const absolutePath = path.resolve(directoryPath);
//     const entries = await fsPromises.readdir(absolutePath, { withFileTypes: true });
//     const mdxFiles: string[] = [];

//     for (const entry of entries) {
//       const entryPath = path.join(absolutePath, entry.name);
//       if (entry.isDirectory()) {
//         const subdirectoryMdxFiles = await listMdxFiles(entryPath);
//         mdxFiles.push(...subdirectoryMdxFiles);
//       } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
//         mdxFiles.push(entryPath);
//       }
//     }

//     return mdxFiles;
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     throw new Error(
//       `Failed to list MDX files in directory ${directoryPath}: ${errorMessage}`
//     );
//   }
// }

// const mdxFiles = await listMdxFiles("./content-source");
// console.log("MDX Files:", mdxFiles);

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
