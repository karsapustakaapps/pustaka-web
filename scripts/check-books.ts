import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";

async function main() {
  if (process.env.PUSTAKA_DATABASE_CHECK !== "books" || !process.env.DATABASE_PATH || process.env.TURSO_DATABASE_URL || process.env.TURSO_AUTH_TOKEN) throw new Error("Use npm run test:books with an isolated local database.");
  const { db, sqlite } = await import("../db");
  const { books, bookGenres, genres, readingEntries, user } = await import("../db/schema");
  const { saveBook, deleteBook } = await import("../lib/book-management");
  const { getCatalog } = await import("../lib/catalog");
  const { getProfile } = await import("../lib/profiles");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    const now = new Date();
    await db.insert(user).values(["admin", "reader"].map((id) => ({ id, name: id, username: `test_${id}`, email: `${id}@example.test`, phoneNumber: "081234567890", role: id === "admin" ? "admin" as const : "reader" as const, createdAt: now, updatedAt: now }))).run();
    await db.insert(genres).values([{ id: "fiksi", name: "Fiksi", description: "" }, { id: "klasik", name: "Klasik", description: "" }]).run();
    const input = { title: " Buku Baru ", author: " Penulis ", cover: "/books/pride-and-prejudice.jpg", description: " Deskripsi buku. ", gutenbergId: "1342" };
    for (const actor of ["reader", "missing"]) assert.ok((await saveBook(actor, null, input, ["fiksi"])).error, "Only current database admins can create books");
    for (const invalid of [
      { title: " " }, { title: "x".repeat(201) }, { author: " " }, { author: "x".repeat(201) },
      { cover: "javascript:alert(1)" }, { cover: "http://example.test/cover.jpg" }, { cover: "//example.test/cover.jpg" }, { cover: "/api/auth/get-session" }, { cover: "/books/../private.jpg" },
      { description: " " }, { description: "x".repeat(10001) },
      { gutenbergId: "" }, { gutenbergId: "0" }, { gutenbergId: "-1" }, { gutenbergId: "1.5" }, { gutenbergId: "1e3" }, { gutenbergId: "2147483648" }, { gutenbergId: true },
    ]) assert.ok((await saveBook("admin", null, { ...input, ...invalid }, ["fiksi"])).error, "Reject invalid book data on the server");
    for (const selection of [[], ["missing"], ["fiksi", "fiksi"]]) assert.ok((await saveBook("admin", null, input, selection)).error);
    assert.equal((await db.select().from(books).all()).length, 0, "Invalid and unauthorized submissions must not write books");

    const created = await saveBook("admin", null, input, ["fiksi", "klasik"]);
    assert.equal(created.error, "");
    assert.ok(created.bookId);
    const bookId = created.bookId;
    const stored = (await db.select().from(books).where(eq(books.id, bookId)).get())!;
    assert.equal(stored.title, "Buku Baru");
    assert.equal(stored.author, "Penulis");
    assert.equal(stored.description, "Deskripsi buku.");
    assert.equal(stored.gutenbergId, 1342);
    assert.equal((await getCatalog({ q: "Buku Baru", genre: "klasik" })).total, 1, "New books are visible in catalog searches and genre filters");
    assert.ok((await saveBook("admin", null, input, ["fiksi"])).error, "Gutenberg IDs must be unique");
    assert.ok((await saveBook("admin", "missing", { ...input, gutenbergId: "999" }, ["fiksi"])).error, "Editing a missing book must not create one");
    await db.insert(readingEntries).values({ userId: "reader", bookId, status: "read", rating: 5, comment: "Ulasan pembaca.", createdAt: now, updatedAt: now }).run();
    assert.ok((await saveBook("reader", bookId, { ...input, title: "Tidak diizinkan" }, ["fiksi"])).error, "Readers cannot edit books");
    assert.ok(await deleteBook("reader", bookId, "on"), "Readers cannot delete books");
    assert.ok(await deleteBook("admin", bookId, null), "Deletion requires explicit confirmation");
    assert.ok(await deleteBook("admin", bookId, "false"));
    assert.deepEqual(await db.select().from(books).where(eq(books.id, bookId)).get(), stored, "Rejected edits and deletes leave the book unchanged");

    const edited = { ...input, title: "Judul Diperbarui", author: "Penulis Baru", description: "Deskripsi baru.", cover: "https://example.test/cover.jpg", gutenbergId: "1343" };
    assert.equal((await saveBook("admin", bookId, edited, ["klasik"])).error, "");
    assert.deepEqual(await db.select().from(books).where(eq(books.id, bookId)).get(), { id: bookId, ...edited, gutenbergId: 1343 });
    assert.deepEqual(await db.select().from(bookGenres).where(eq(bookGenres.bookId, bookId)).all(), [{ bookId, genreId: "klasik" }], "Editing replaces the genre selection");
    assert.equal((await db.select().from(readingEntries).where(eq(readingEntries.bookId, bookId)).get())?.comment, "Ulasan pembaca.", "Editing retains reviews and the stable book ID");
    assert.equal((await getProfile("test_reader", "reader"))?.activity?.[0].title, edited.title, "Profiles show edited book data");
    assert.ok((await saveBook("admin", bookId, { ...edited, title: "Tidak tersimpan" }, ["missing"])).error);

    await sqlite.executeMultiple("CREATE TRIGGER reject_book_genre BEFORE INSERT ON book_genres WHEN NEW.genre_id = 'fiksi' BEGIN SELECT RAISE(ABORT, 'Test genre failure'); END;");
    await assert.rejects(saveBook("admin", bookId, { ...edited, title: "Harus dibatalkan" }, ["fiksi"]));
    assert.equal((await db.select().from(books).where(eq(books.id, bookId)).get())?.title, edited.title, "A genre write failure rolls back the book edit");
    assert.deepEqual(await db.select().from(bookGenres).where(eq(bookGenres.bookId, bookId)).all(), [{ bookId, genreId: "klasik" }], "A failed edit preserves previous genres");
    await assert.rejects(saveBook("admin", null, { ...input, gutenbergId: "999" }, ["fiksi"]));
    assert.equal((await db.select().from(books).all()).length, 1, "A genre write failure rolls back book creation");
    await sqlite.execute("DROP TRIGGER reject_book_genre");

    const other = await saveBook("admin", null, { ...input, gutenbergId: "999" }, ["fiksi"]);
    assert.equal(other.error, "");
    assert.ok((await saveBook("admin", bookId, { ...edited, gutenbergId: "999" }, ["klasik"])).error, "An edit cannot claim another book's Gutenberg ID");
    await db.update(user).set({ role: "reader" }).where(eq(user.id, "admin")).run();
    assert.ok((await saveBook("admin", bookId, edited, ["fiksi"])).error, "Demoted admins lose write access immediately");
    assert.ok(await deleteBook("admin", bookId, "on"));
    await db.update(user).set({ role: "admin" }).where(eq(user.id, "admin")).run();
    assert.equal(await deleteBook("admin", bookId, "on"), null);
    assert.equal(await db.select().from(books).where(eq(books.id, bookId)).get(), undefined);
    assert.equal((await db.select().from(bookGenres).where(eq(bookGenres.bookId, bookId)).all()).length, 0);
    assert.equal((await db.select().from(readingEntries).where(eq(readingEntries.bookId, bookId)).all()).length, 0, "Confirmed deletion cascades to reading history, ratings, and reviews");
    assert.equal((await getProfile("test_reader", "reader"))?.activity?.length, 0);
    assert.equal((await getCatalog({})).total, 1, "Deletion preserves other books");
    assert.ok(await deleteBook("admin", bookId, "on"), "Repeated deletion reports the missing book");
    assert.deepEqual((await sqlite.execute("PRAGMA foreign_key_check")).rows, []);
    console.log("Book CRUD checks passed: admin authorization, validation, unique IDs, atomic genres, preserved reviews, catalog/profile updates, and confirmed cascading deletion.");
  } finally {
    sqlite.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
