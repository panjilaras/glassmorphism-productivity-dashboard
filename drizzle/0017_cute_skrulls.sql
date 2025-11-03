DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `user` ADD `position` text;--> statement-breakpoint
ALTER TABLE `user` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `manager_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `user` ADD `join_date` text;--> statement-breakpoint
ALTER TABLE `user` ADD `avatar_url` text;