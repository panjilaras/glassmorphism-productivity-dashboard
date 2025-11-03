CREATE TABLE `theme_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`background_gradient_colors` text NOT NULL,
	`background_opacity` real NOT NULL,
	`background_image` text,
	`login_background_color` text NOT NULL,
	`login_icon_color` text NOT NULL,
	`login_card_opacity` real NOT NULL,
	`login_icon_image` text,
	`card_background_color` text NOT NULL,
	`card_opacity` real NOT NULL,
	`card_border_opacity` real NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
