# Drizzle ORM Integration Plan

## Goals
- Integrate Drizzle ORM with the existing SQLite (`better-sqlite3`) setup.
- Preserve the current CLI workflow and consolidate schema migrations in Drizzle.
- Keep repository APIs stable where possible.

## Architecture Overview (Target)
- **Database Connection**: `better-sqlite3` remains the low-level connection.
- **ORM Layer**: Drizzle wraps the same connection for typed queries.
- **Schema Source of Truth**: Drizzle schema + `drizzle-kit` migrations.
- **Repositories**: Move CRUD to Drizzle queries, minimize raw SQL.
- **Migration Service**: Keep the transaction on the raw connection; repositories use Drizzle.

## Tasks
1. **Add Drizzle ORM dependencies**
   - Add `drizzle-orm` to `package.json` dependencies.
2. **Wire in drizzle-kit**
   - Add `drizzle-kit` as a dev dependency.
   - Add `drizzle.config.ts` at repo root.
   - Add `drizzle:*` scripts for generate/push/studio.
3. **Create Drizzle schema definitions**
   - Define `content`, `tags`, `content_tags` in `parsers/nextjs-mdx/database/drizzle/schema.ts`.
   - Export table types for repository typing.
4. **Create Drizzle connection helper**
   - Add `parsers/nextjs-mdx/database/drizzle/connection.ts` that wraps `better-sqlite3`.
5. **Refactor repositories to Drizzle**
   - `contentRepository.ts`: use Drizzle `insert/select/delete`.
   - `tagRepository.ts`: use Drizzle `insert/select/join`.
6. **Update app entrypoint**
   - Build Drizzle DB from the existing connection in `parsers/nextjs-mdx/index.ts`.
   - Pass Drizzle DB to repositories.
7. **Validate runtime behavior**
   - Run `yarn test:unit` (or `yarn start`) and fix any type/runtime issues.
8. **Retire legacy SQL migrations**
   - Remove `database/schema.ts` usage and related unit tests.

## TODOs
- [ ] Decide if `content-source` should remain the default root (currently yes).
- [ ] Confirm existing SQL migrations match Drizzle schema definitions.
- [ ] Add repository integration tests later (optional).

## Dependencies
- `better-sqlite3` (already used)
- `drizzle-orm`
- `drizzle-kit`

## Risks / Notes
- Drizzle schema must reflect current DB shape before generating migrations.
- If Drizzle `returning()` isn’t used, IDs should be resolved via a follow-up query.
- Keep transaction boundaries on the raw connection to avoid async transaction errors.
- `drizzle-kit` uses `drizzle.config.ts` and reads `DATABASE_PATH` for SQLite DB location.
