CREATE TABLE `deployment_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version` text NOT NULL,
	`date` text NOT NULL,
	`title` text NOT NULL,
	`features` text NOT NULL,
	`is_latest` integer DEFAULT 0,
	`created_at` text NOT NULL
);
