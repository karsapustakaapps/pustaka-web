ALTER TABLE `users` ADD `username` text DEFAULT 'pembaca' NOT NULL;--> statement-breakpoint
UPDATE `users` SET `username` = 'pembaca_' || rowid;--> statement-breakpoint
ALTER TABLE `users` ADD `public_history` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
