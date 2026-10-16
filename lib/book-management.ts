import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { books, bookGenres } from "@/db/schema";
import { isAdminUser } from "./roles";
import { validateGenrePreferences } from "./preferences";

const bookSchema = z.object({
  title: z.string().trim().min(1, "Judul buku wajib diisi.").max(200, "Judul maksimal 200 karakter."),
  author: z.string().trim().min(1, "Nama penulis wajib diisi.").max(200, "Nama penulis maksimal 200 karakter."),
  cover: z.string().trim().max(2048, "Alamat sampul maksimal 2.048 karakter.").refine((value) => /^\/books\/[a-z0-9_-]+\.(jpg|jpeg|png|webp|avif|gif)$/i.test(value) || (URL.canParse(value) && new URL(value).protocol === "https:"), "Gunakan URL HTTPS atau alamat sampul /books/nama-file.jpg."),
  description: z.string().trim().min(1, "Deskripsi wajib diisi.").max(10000, "Deskripsi maksimal 10.000 karakter."),
  gutenbergId: z.string().trim().regex(/^[1-9]\d*$/, "ID Project Gutenberg harus berupa bilangan bulat positif.").transform(Number).pipe(z.number().int().max(2147483647, "ID Project Gutenberg terlalu besar.")),
});

export async function saveBook(adminId: string, bookId: string | null, input: unknown, values: FormDataEntryValue[]): Promise<{ error: string; bookId?: string }> {
  if (!await isAdminUser(adminId)) return { error: "Hanya admin yang dapat mengelola buku." };
  const result = bookSchema.safeParse(input);
  if (!result.success) return { error: result.error.issues[0].message };
  const preferences = await validateGenrePreferences(values);
  if (preferences.error) return { error: preferences.error };
  const id = bookId ?? randomUUID();
  const duplicate = () => db.select({ id: books.id }).from(books)
    .where(and(eq(books.gutenbergId, result.data.gutenbergId), ne(books.id, id))).get();
  if (await duplicate()) return { error: "ID Project Gutenberg ini sudah digunakan buku lain." };
  try {
    return await db.transaction(async (tx) => {
      if (bookId !== null) {
        const updated = await tx.update(books).set(result.data).where(eq(books.id, id)).returning({ id: books.id }).get();
        if (!updated) return { error: "Buku tidak ditemukan. Muat ulang koleksi." };
      } else {
        await tx.insert(books).values({ id, ...result.data }).run();
      }
      await tx.delete(bookGenres).where(eq(bookGenres.bookId, id)).run();
      await tx.insert(bookGenres).values(preferences.ids.map((genreId) => ({ bookId: id, genreId }))).run();
      return { error: "", bookId: id };
    });
  } catch (error) {
    // The unique constraint also protects concurrent submissions with the same Gutenberg ID.
    if (await duplicate()) return { error: "ID Project Gutenberg ini sudah digunakan buku lain." };
    throw error;
  }
}

export async function deleteBook(adminId: string, bookId: string, confirmation: FormDataEntryValue | null) {
  if (!await isAdminUser(adminId)) return "Hanya admin yang dapat mengelola buku.";
  if (confirmation !== "on") return "Konfirmasi penghapusan buku terlebih dahulu.";
  const deleted = await db.delete(books).where(eq(books.id, bookId)).returning({ id: books.id }).get();
  return deleted ? null : "Buku tidak ditemukan. Muat ulang koleksi.";
}
