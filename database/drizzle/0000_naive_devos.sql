CREATE TABLE `content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`date` text,
	`status` text DEFAULT 'draft'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_slug_unique` ON `content` (`slug`);