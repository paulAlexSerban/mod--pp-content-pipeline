ALTER TABLE `content` ADD `subheading` text;--> statement-breakpoint
ALTER TABLE `content` ADD `excerpt` text;--> statement-breakpoint
ALTER TABLE `content` ADD `author` text;--> statement-breakpoint
ALTER TABLE `content` ADD `markdown_content` text NOT NULL;--> statement-breakpoint
ALTER TABLE `content` ADD `compiled_content` text;--> statement-breakpoint
ALTER TABLE `content` ADD `full_path` text;