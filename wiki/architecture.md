# Architecture Overview

## High-Level Flow
1. **Content acquisition**: clone or pull sources via scripts.
2. **File discovery**: scan `content-source` for supported types and file extensions.
3. **Parsing**: parse MD/MDX, extract frontmatter, and compile content.
4. **Normalization**: map parsed content into structured `IContentData`.
5. **Persistence**: write to SQLite using Drizzle ORM on top of `better-sqlite3`.
6. **Consumers**: portfolio apps read the SQLite output.

## Key Modules
- **Entry**: `parsers/nextjs-mdx/index.ts`
  - Wires DB connection, schema initialization, repositories, and migration service.
- **Database Layer**:
  - `database/connection.ts`: low-level SQLite connection.
  - `database/schema.ts`: executes SQL migration files.
  - `database/drizzle/*`: Drizzle schema + DB wrapper.
  - `database/repositories/*`: data access via Drizzle ORM.
- **Parsing Layer**:
  - `parsers/mdxParser.ts`: MDX parsing and compilation.
  - `parsers/frontmatterExtractor.ts`: structured data extraction.
- **Services**:
  - `services/migrationService.ts`: orchestrates scanning, parsing, and DB writes.
- **Utils**:
  - `utils/fileScanner.ts`: discovers content in `content-source`.

## Data Model (Core)
- **content**: canonical content records (slug, type, title, markdown, compiled content).
- **tags**: normalized tags.
- **content_tags**: many-to-many linkage.

## Transactions
- Content insert and tag linkage are wrapped in a synchronous SQLite transaction to ensure consistency.

## Extensibility Points
- Add new parsers under `parsers/` and plug them into a new migration service.
- Extend schema via SQL migrations + Drizzle schema updates.
- Add repositories for new tables.
