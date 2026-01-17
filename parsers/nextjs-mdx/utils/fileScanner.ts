import fs from "fs/promises";
import path from "path";

export type DirectoryPath = {
  baseDir: string;
  sourceFolders?: string[];
  typePattern?: RegExp;
};

export type ScannedDirectory = {
  typeName: string;
  path: string;
  files: string[];
};

export class FileScanner {
  async scanDirectory({
    baseDir,
    sourceFolders = ["backlog", "publish"],
    typePattern = /projects|coursework|posts|booknotes|snippets/,
  }: DirectoryPath): Promise<ScannedDirectory[]> {
    const result: ScannedDirectory[] = [];
    for (const sourceFolder of sourceFolders) {
      const sourcePath = path.join(baseDir, sourceFolder);
      const contentItems = await fs.readdir(sourcePath, { withFileTypes: true });
      const filteredItems = contentItems.filter(
        (item) => item.isDirectory() && typePattern.test(item.name),
      );

      for (const item of filteredItems) {
        const itemPath = path.join(sourcePath, item.name);
        const files = await fs.readdir(itemPath);
        const mdxFiles = files.filter(
          (file) => file.endsWith(".mdx") || file.endsWith(".md"),
        );

        result.push({
          typeName: item.name,
          path: itemPath,
          files: mdxFiles,
        });
      }
    }

    return result;
  }
}
