import { DatabaseConnection } from "./database/connection.ts";

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
  const dbPath = process.env.DATABASE_PATH || "./database/content.db";
  const dbConnection = new DatabaseConnection(dbPath);
  const db = dbConnection.getConnection();

  // test database connection
  const row = db.prepare("SELECT sqlite_version() AS version").get() as { version: string };
  console.log("SQLite Version:", row.version);

  dbConnection.close();
};

main();
