import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { migrate } from "drizzle-orm/libsql/migrator";
async function main() {
  if (process.env.PUSTAKA_DATABASE_CHECK !== "catalog" || !process.env.DATABASE_PATH || process.env.TURSO_DATABASE_URL || process.env.TURSO_AUTH_TOKEN) throw new Error("Use npm run test:catalog with an isolated local database.");
  const directory = dirname(process.env.DATABASE_PATH);
  process.env.TURSO_DATABASE_URL = pathToFileURL(process.env.DATABASE_PATH).href;
  process.env.DATABASE_PATH = join(directory, "unused", "test.db");
  const { db, sqlite } = await import("../db");
  const { books, bookGenres, genres, readingEntries, user } = await import("../db/schema");
  const { catalogPageSize, getCatalog } = await import("../lib/catalog");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    assert.equal(existsSync(join(directory, "unused")), false, "A database URL takes precedence over the local path without creating a local directory");
    assert.equal((await getCatalog({})).total, 0, "An empty catalog remains browsable");
    assert.equal((await getCatalog({})).page, 1);
    await db.insert(genres).values([{ id: "fiksi", name: "Fiksi", description: "" }, { id: "klasik", name: "Klasik", description: "" }]).run();
    await db.insert(books).values(Array.from({ length: 53 }, (_, index) => ({ id: `book-${index}`, title: `Buku ${String(index).padStart(2, "0")}`, author: index === 0 ? "Jane Austen" : "Penulis lain", cover: "/test.jpg", description: "", gutenbergId: index + 1 }))).run();
    await db.insert(bookGenres).values([{ bookId: "book-0", genreId: "fiksi" }, { bookId: "book-0", genreId: "klasik" }, { bookId: "book-1", genreId: "fiksi" }]).run();
    const now = new Date();
    await db.insert(user).values(["a", "b", "c"].map((id) => ({ id, name: id, username: `reader_${id}`, email: `${id}@example.test`, phoneNumber: "081234567890", createdAt: now, updatedAt: now }))).run();
    await db.insert(readingEntries).values([
      { userId: "a", bookId: "book-0", rating: 5 },
      { userId: "b", bookId: "book-0", rating: null },
      { userId: "a", bookId: "book-1", rating: 5 },
      { userId: "b", bookId: "book-1", rating: 5 },
      { userId: "a", bookId: "book-2", rating: 3 },
      { userId: "b", bookId: "book-2", rating: 4 },
      { userId: "c", bookId: "book-2", rating: 5 },
      { userId: "a", bookId: "book-3", rating: null },
    ].map((entry) => ({ ...entry, status: "read" as const, createdAt: now, updatedAt: now }))).run();
    const first = await getCatalog({});
    assert.equal(first.books.length, catalogPageSize);
    assert.equal(first.total, 53);
    assert.equal(first.pages, 3);
    assert.deepEqual(first.books.slice(0, 3).map((book) => book.id), ["book-1", "book-0", "book-2"], "Rating ties favor more ratings; unrated books follow rated books");
    assert.equal(Number(first.books[1].average), 5, "Unrated entries do not lower the average");
    assert.equal(first.books[1].ratings, 1, "Genre relationships do not inflate rating counts");
    assert.equal((await getCatalog({ sort: "ratings" })).books[0].id, "book-2", "Most-rated ordering uses rating count");
    assert.equal((await getCatalog({ q: "  JANE  " })).books[0].id, "book-0", "Author search ignores ASCII case and surrounding spaces");
    assert.equal((await getCatalog({ q: "bUkU 01" })).books[0].id, "book-1", "Title search ignores ASCII case");
    assert.equal((await getCatalog({ q: "%" })).total, 0, "SQL wildcard characters are searched literally");
    assert.equal((await getCatalog({ q: "_" })).total, 0);
    assert.equal((await getCatalog({ q: "\\" })).total, 0);
    assert.equal((await getCatalog({ q: "' OR 1=1 --" })).total, 0, "Search text is bound as data");
    assert.equal((await getCatalog({ genre: "fiksi" })).total, 2);
    assert.deepEqual((await getCatalog({ genre: "klasik", q: "jane" })).books.map((book) => book.id), ["book-0"], "Genre and search combine");
    assert.equal((await getCatalog({ genre: "klasik", q: "missing" })).total, 0);
    assert.equal((await getCatalog({ genre: "unknown", sort: "unknown" })).total, 53, "Unknown filters fall back safely");
    for (const page of ["-1", "0", "1.5", "abc", "999999999999999999999"])
      assert.equal((await getCatalog({ page })).page, 1);
    assert.equal((await getCatalog({ page: "999" })).page, 3, "Out-of-range pages clamp to the last page");
    assert.equal((await getCatalog({ page: "2", q: "missing" })).page, 1, "Empty results reset pagination");
    assert.equal((await getCatalog({ q: ["Jane", "other"], genre: ["fiksi"], sort: ["ratings"], page: ["2"] })).total, 53, "Repeated parameters fall back safely");
    const all = [first, await getCatalog({ page: "2" }), await getCatalog({ page: "3" })].flatMap((result) => result.books);
    assert.equal(all.length, 53);
    assert.equal(new Set(all.map((book) => book.id)).size, 53, "Pagination has no missing or repeated books");
    assert.deepEqual(all.filter((book) => !book.ratings).map((book) => book.title), [...all.filter((book) => !book.ratings).map((book) => book.title)].sort(), "Unrated books have a stable title order");
    assert.deepEqual(Object.keys(first.books[0]).sort(), ["author", "average", "cover", "id", "ratings", "title"], "Catalog queries expose only public book fields and aggregate ratings");
    console.log("Catalog checks passed: real ratings, stable ranking, literal search, shared genres, safe parameters, and complete pagination.");
  } finally {
    sqlite.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
