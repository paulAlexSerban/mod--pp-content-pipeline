import path from "path";
import { FileScanner, type DirectoryPath } from "../utils/fileScanner.ts";
import { MDXParser, type IParsedMDX } from "../parsers/mdxParser.ts";
import { FrontmatterExtractor } from "../parsers/frontmatterExtractor.ts";
import {
  ContentRepository,
  type IContentData,
} from "../database/repositories/contentRepository.ts";
// import {
//   type ITagRepository,
//   type ITag,
// } from "../database/repositories/tagRepository.ts";
import type { IDatabase } from "../database/connection.ts";

export class MigrationService {
  private fileScanner: FileScanner;
  private mdxParser: MDXParser;
  private frontmatterExtractor: FrontmatterExtractor;
  private contentRepo: ContentRepository;
  // private tagRepo: ITagRepository;
  private db: IDatabase;

  constructor(
    fileScanner: FileScanner,
    mdxParser: MDXParser,
    frontmatterExtractor: FrontmatterExtractor,
    contentRepo: ContentRepository,
    // tagRepo: ITagRepository,
    db: IDatabase,
  ) {
    this.fileScanner = fileScanner;
    this.mdxParser = mdxParser;
    this.frontmatterExtractor = frontmatterExtractor;
    this.contentRepo = contentRepo;
    // this.tagRepo = tagRepo;
    this.db = db;
  }

  async migrate(contentDirectory: DirectoryPath) {
    console.log("Starting migration...");
    const contentFiles = await this.fileScanner.scanDirectory(contentDirectory);

    let totalProcessed = 0;
    let totalErrors = 0;
    const insertContentWithTags = this.db.transaction(
      (contentDataObject: IContentData, tags?: string[]) => {
        const contentId = this.contentRepo.insertContent(contentDataObject);

        // if (tags && tags.length > 0) {
        //   for (const tag of tags) {
        //     const tagSlug = this.frontmatterExtractor.sanitizeTag(tag);
        //     this.tagRepo.insertTag(tag, tagSlug);
        //     const tagRecord: ITag | undefined =
        //       this.tagRepo.findBySlug(tagSlug);
        //     if (tagRecord) {
        //       this.tagRepo.linkTagToContent(contentId, tagRecord.id);
        //     }
        //   }
        // }

        return contentId;
      },
    );

    for (const typeGroup of contentFiles) {
      const { typeName, path: typePath, files } = typeGroup;
      console.log(`Processing ${typeName}: ${files.length} files`);

      for (const filename of files) {
        try {
          const filePath = path.join(typePath, filename);
          const slug = filename.replace(".mdx", "");

          // Parse MDX file
          const parsed: IParsedMDX = await this.mdxParser.parseFile(filePath);

          // Extract structured data
          const contentData = this.frontmatterExtractor.extractContentData(
            parsed.frontmatter,
            parsed.markdownContent,
            slug,
            typeName,
            parsed.fullPath,
          );

          // Insert content
          const contentDataObject: IContentData = {
            ...contentData,
            // subheading: contentData.subheading ?? "",
            // excerpt: contentData.excerpt ?? "",
            // author: contentData.author ?? "",
            date: contentData.date ?? "",
            // repo_url: contentData.repo_url ?? "",
            // demo_url: contentData.demo_url ?? "",
            // compiled_content: parsed.compiledContent,
          };

          insertContentWithTags(contentDataObject, contentData.tags);

          totalProcessed++;
          console.log(`✓ Processed: ${typeName}/${slug}`);
        } catch (error) {
          totalErrors++;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(`✗ Error processing ${filename}:`, errorMessage);
        }
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`Total processed: ${totalProcessed}`);
    console.log(`Total errors: ${totalErrors}`);
  }
}
