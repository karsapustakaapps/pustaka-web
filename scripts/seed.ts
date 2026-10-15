import "./load-env";
import { db, sqlite } from "../db";
import { books, genres, bookGenres } from "../db/schema";
import { initialBooks } from "../lib/catalog-data";
import { initialGenres } from "../lib/genre-data";

async function main() {
  await db.batch([
    db.insert(genres).values([...initialGenres]).onConflictDoNothing(),
    db.insert(books).values(initialBooks.map((book) => ({
      id: book.slug, title: book.title, author: book.author, cover: book.cover,
      description: book.description, gutenbergId: book.gutenberg,
    }))).onConflictDoNothing(),
    db.insert(bookGenres).values(initialBooks.flatMap((book) => book.genres.map((genreId) => ({ bookId: book.slug, genreId })))).onConflictDoNothing(),
  ]);
  console.log("Koleksi awal: 6 buku dan 6 genre siap digunakan.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => sqlite.close());
