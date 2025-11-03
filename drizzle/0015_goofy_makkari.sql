DROP INDEX "assets_serial_number_unique";--> statement-breakpoint
DROP INDEX "documentation_categories_name_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "task_categories_name_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "role" TO "role" text NOT NULL DEFAULT 'viewer';--> statement-breakpoint
CREATE UNIQUE INDEX `assets_serial_number_unique` ON `assets` (`serial_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `documentation_categories_name_unique` ON `documentation_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_categories_name_unique` ON `task_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "role" TO "role" text NOT NULL DEFAULT 'viewer';