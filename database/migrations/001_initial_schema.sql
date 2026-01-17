-- Content table (main content storage)
CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,              -- projects, posts, coursework, booknotes, snippets
    title TEXT NOT NULL,
    subheading TEXT,
    excerpt TEXT,
    author TEXT,
    date TEXT,                       -- Store as ISO string: YYYY-MM-DD
    status TEXT DEFAULT 'draft',     -- published, draft
    pinned INTEGER DEFAULT 0,        -- Boolean: 0 or 1
    repo_url TEXT,
    demo_url TEXT,
    markdown_content TEXT NOT NULL,  -- Raw markdown content (without frontmatter)
    compiled_content TEXT,           -- Serialized MDX (optional, for faster loading)
    full_path TEXT,                  -- Original file path
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tags table (normalized tag storage)
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,       -- Sanitized version for URLs
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Content-Tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS content_tags (
    content_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (content_id, tag_id),
    FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Categories table (if needed)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Content-Categories junction table
CREATE TABLE IF NOT EXISTS content_categories (
    content_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (content_id, category_id),
    FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_date ON content(date);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);