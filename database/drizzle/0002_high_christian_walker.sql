PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`date` text,
	`status` text DEFAULT 'draft',
	`subheading` text,
	`excerpt` text,
	`author` text,
	`markdown_content` text DEFAULT '' NOT NULL,
	`compiled_content` text,
	`full_path` text
);
--> statement-breakpoint
INSERT INTO `__new_content`("id", "slug", "type", "title", "date", "status", "subheading", "excerpt", "author", "markdown_content", "compiled_content", "full_path") SELECT "id", "slug", "type", "title", "date", "status", "subheading", "excerpt", "author", "markdown_content", "compiled_content", "full_path" FROM `content`;--> statement-breakpoint
DROP TABLE `content`;--> statement-breakpoint
ALTER TABLE `__new_content` RENAME TO `content`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `content_slug_unique` ON `content` (`slug`);