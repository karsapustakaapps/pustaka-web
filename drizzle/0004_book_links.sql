DROP INDEX `books_gutenberg_id_unique`;--> statement-breakpoint
ALTER TABLE `books` ADD `book_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `books` SET `book_url` = 'https://www.gutenberg.org/ebooks/' || `gutenberg_id`;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `gutenberg_id`;
