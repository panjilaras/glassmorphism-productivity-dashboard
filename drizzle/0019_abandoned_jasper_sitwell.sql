CREATE TABLE `task_bonus_points` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`bonus_points` integer NOT NULL,
	`awarded_by` text,
	`reason` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`awarded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
