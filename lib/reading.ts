import { and, avg, count, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { books, readingEntries, user } from "@/db/schema";

const entrySchema = z.object({
  status: z.enum(["want_to_read", "reading", "read"], { error: "Pilih status baca yang tersedia." }),
  rating: z.preprocess((value) => value === null || value === "" || value === "0" ? null : typeof value === "string" ? Number(value) : value, z.number().int().min(1).max(5).nullable()),
  comment: z.string().trim().max(2000, "Ulasan maksimal 2.000 karakter."),
});

export async function saveReadingEntry(userId: string, bookId: string, input: unknown) {
  const result = entrySchema.safeParse(input);
  if (!result.success) return result.error.issues[0].path[0] === "rating" ? "Pilih nilai 1–5 bintang atau tanpa nilai." : result.error.issues[0].message;
  if (!await db.select({ id: books.id }).from(books).where(eq(books.id, bookId)).get()) return "Buku tidak ditemukan.";
  const now = new Date();
  await db.insert(readingEntries).values({ userId, bookId, ...result.data, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: [readingEntries.userId, readingEntries.bookId], set: { ...result.data, updatedAt: now } }).run();
  return null;
}

export async function getBookRating(bookId: string) {
  return (await db.select({ average: avg(readingEntries.rating), count: count(readingEntries.rating), readers: count() })
    .from(readingEntries).where(eq(readingEntries.bookId, bookId)).get())!;
}

export function getBookReviews(bookId: string) {
  return db.select({ userId: user.id, name: user.name, username: user.username, status: readingEntries.status, rating: readingEntries.rating, comment: readingEntries.comment, updatedAt: readingEntries.updatedAt })
    .from(readingEntries).innerJoin(user, eq(user.id, readingEntries.userId))
    .where(and(eq(readingEntries.bookId, bookId), ne(readingEntries.comment, "")))
    .orderBy(desc(readingEntries.updatedAt)).limit(20).all();
}
