# Module (Personal Portfolio): Content Pipeline

What it does:
- clones content from private GitHub repository
- depending on the file type, processes the content accordingly (md, mdx, images, videos, etc.)
- outputs the processed content to a specified directory in a SQLite database and commits it
- output content will be polled by the main portfolio applications
- portfolio application will be mainly built with Next.js and Typescript

Application Type:
- Console Application / CLI used as a content pipeline for personal portfolio website

Techstack:
- Node.js
- Typescript
- SQLite (better-sqlite3)
- GitHub API
- Jest for testing
- MDX parsing libraries

Folder Structure:
- /parsers: contains different parsers for various content types (e.g., Next.js MDX)
- /database: contains database connection and schema files
- /utils: utility functions for file handling, Git operations, etc.
- /**/__tests__: integration and unit tests for the application
- /.env: environment variables for configuration (e.g., GitHub tokens, repo URLs)
- /scripts: scripts for automating tasks like cloning repos, processing content, etc.
- /README.md: project documentation
- /.github: GitHub workflows for CI/CD

## Testing

This project uses Jest with separate configurations for unit and integration tests.

### Running Tests

```bash
# Run all tests
yarn test

# Run only unit tests
yarn test:unit

# Run only integration tests
yarn test:integration

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Test Structure

- **Unit Tests**: `*.test.ts` - Fast, isolated tests with mocked dependencies
- **Integration Tests**: `*.integration.test.ts` - Tests that interact with real systems (database, filesystem, etc.)

---

## Testing Philosophy: When to Write Unit vs Integration Tests

### **Brutally Honest Guidelines**

#### Write **INTEGRATION TESTS** when:
- ✅ Testing **real I/O operations** (file system, database, network)
- ✅ Verifying **actual system behavior** (does the database schema really work?)
- ✅ Testing **external dependencies** (SQLite, AWS S3, GitHub API)
- ✅ You want to know if something **actually works in reality**, not just in theory
- ✅ The cost of a bug is **high** (data corruption, migration failures, production issues)
- ✅ **State persistence matters** (data must survive across operations)

**Examples in this project:**
- `connection.integration.test.ts` - Tests real SQLite connections, pragmas, and transactions
- `schema.integration.test.ts` - Verifies actual table creation, indexes, foreign keys, and cascade deletes

#### Write **UNIT TESTS** when:
- ✅ Testing **pure business logic** (calculations, transformations, algorithms)
- ✅ Verifying **method calls and parameters** (did X call Y with Z?)
- ✅ Testing **error handling paths** without expensive setup
- ✅ You need **fast feedback** during development (hundreds run in seconds)
- ✅ The code has **no external dependencies** or they can be meaningfully mocked

**Examples in this project:**
- `schema.test.ts` - Verifies Schema class calls `fs.readFileSync` and `db.exec` correctly
- Future: MDX parser logic (frontmatter extraction, content sanitization)
- Future: Slug generation, date formatting, validation functions

#### ❌ **Don't Write Unit Tests** when:
- You'd just be **testing that mocks work** (this is useless)
- The real operation is **cheap and fast** (just use an integration test)
- You're mocking so much the test becomes **meaningless**
- You can't verify **actual correctness** without the real dependency

#### 🎯 **The Hard Truth**
- **Integration tests are slower but actually verify your code works**
- **Unit tests are faster but can give false confidence if overused**
- **Most database/file/network operations should be integration tested**
- **Pure logic and algorithms should be unit tested**
- **When in doubt, write the integration test first**, then add unit tests for speed

#### 📊 **Test Coverage Goals**
- **Integration Tests**: Critical paths (database operations, file processing, API calls)
- **Unit Tests**: Business logic, edge cases, error handling
- **Don't chase 100% coverage** - focus on **high-risk, high-value code**

#### 🔥 **Real Talk**
If your unit test looks like this:
```typescript
mockDb.exec = jest.fn();
schema.initialize();
expect(mockDb.exec).toHaveBeenCalled();
```

You're testing **nothing useful**. Write an integration test instead that verifies the tables actually get created.

---

### Current Test Coverage

#### Database Layer
- ✅ **Connection** (Integration): Real SQLite connections, WAL mode, foreign keys, transactions
- ✅ **Schema** (Both): 
  - Unit: Method calls and error handling
  - Integration: Actual table creation, indexes, constraints, real-world scenarios

#### Future Testing Priorities
- 🔲 MDX Parser (Unit + Integration)
- 🔲 Content Repository (Integration)
- 🔲 File Processing Pipeline (Integration)
- 🔲 GitHub API Integration (Integration with mocked HTTP if needed)