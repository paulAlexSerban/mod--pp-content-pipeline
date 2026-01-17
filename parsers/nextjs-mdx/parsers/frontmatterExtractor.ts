interface Frontmatter {
  title?: string;
  subheading?: string;
  excerpt?: string;
  author?: string;
  date?: string;
  status?: string;
  pinned?: boolean;
  repo_url?: string;
  demo_url?: string;
  tags?: string[];
  categories?: string[];
}

interface ContentData {
  slug: string;
  type: string;
  title: string;
  subheading: string | null;
  excerpt: string | null;
  author: string | null;
  date: string | null;
  status: string;
  pinned: number;
  repo_url: string | null;
  demo_url: string | null;
  markdown_content: string;
  full_path: string;
  tags: string[];
  categories: string[];
}

export class FrontmatterExtractor {
  extractContentData(
    frontmatter: Frontmatter,
    markdownContent: string,
    slug: string,
    type: string,
    fullPath: string,
  ): ContentData {
    return {
      slug,
      type,
      title: frontmatter.title || "Untitled",
      subheading: frontmatter.subheading || null,
      excerpt: frontmatter.excerpt || null,
      author: frontmatter.author || null,
      date: frontmatter.date || null,
      status: frontmatter.status || "draft",
      pinned: frontmatter.pinned ? 1 : 0,
      repo_url: frontmatter.repo_url || null,
      demo_url: frontmatter.demo_url || null,
      markdown_content: markdownContent,
      full_path: fullPath,
      tags: frontmatter.tags || [],
      categories: frontmatter.categories || [],
    };
  }

  sanitizeTag(tag: string): string {
    return tag
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
}
