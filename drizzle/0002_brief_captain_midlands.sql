CREATE TABLE `reading_entries` (
	`user_id` text NOT NULL,
	`book_id` text NOT NULL,
	`status` text DEFAULT 'want_to_read' NOT NULL,
	`rating` integer,
	`comment` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `book_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reading_status_valid" CHECK("reading_entries"."status" in ('want_to_read', 'reading', 'read')),
	CONSTRAINT "reading_rating_valid" CHECK("reading_entries"."rating" is null or ("reading_entries"."rating" between 1 and 5 and typeof("reading_entries"."rating") = 'integer')),
	CONSTRAINT "reading_comment_length" CHECK(length("reading_entries"."comment") <= 2000)
);
--> statement-breakpoint
CREATE INDEX `reading_entries_book_idx` ON `reading_entries` (`book_id`);--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'reader' NOT NULL;