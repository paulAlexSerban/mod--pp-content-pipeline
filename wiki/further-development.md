# Further Development Guide

## Drizzle ORM Next Steps
- `drizzle-kit` is wired in; use it to generate or push migrations.
- Consider switching SQL migrations to Drizzle migrations (optional).
- Add repository integration tests against a temporary SQLite DB.

## Data Quality
- Add validation for required frontmatter fields before insertion.
- Normalize dates into ISO format consistently.
- Add deterministic slug generation for all content types.

## Pipeline Enhancements
- Add a dry-run mode that parses content without writing to DB.
- Add incremental updates by checking file hashes or `updated_at`.
- Add CLI flags for filtering content types or folders.

## Observability
- Add structured logging with a log level flag.
- Summarize counts by content type and file extension.

## Performance
- Batch filesystem reads by type.
- Preload and cache Markdown/MDX compile steps if needed.

## Testing Strategy
- Expand integration tests for repositories and migration service.
- Add fixture content with representative frontmatter.

## Compatibility
- Keep `.md` and `.mdx` supported in `fileScanner`.
- Ensure `content-source` remains the default root path.
