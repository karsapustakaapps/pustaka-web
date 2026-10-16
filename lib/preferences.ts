import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { genres, user, userGenres } from "@/db/schema";

export async function validateGenrePreferences(values: FormDataEntryValue[]) {
  const ids = [...new Set(values.filter((value): value is string => typeof value === "string"))];
  if (!ids.length || ids.length !== values.length || ids.length > 20) return { error: "Pilih 1–20 genre yang tersedia tanpa pilihan berulang.", ids: [] };
  const valid = await db.select({ id: genres.id }).from(genres).where(inArray(genres.id, ids)).all();
  if (valid.length !== ids.length) return { error: "Ada genre yang tidak tersedia. Muat ulang halaman dan pilih kembali.", ids: [] };
  return { error: null, ids };
}

export async function saveGenrePreferences(userId: string, values: FormDataEntryValue[]) {
  const { error, ids } = await validateGenrePreferences(values);
  if (error) return error;
  await db.transaction(async (tx) => {
    await tx.delete(userGenres).where(eq(userGenres.userId, userId)).run();
    await tx.insert(userGenres).values(ids.map((genreId) => ({ userId, genreId }))).run();
    await tx.update(user).set({ onboardingCompleted: true, updatedAt: new Date() }).where(eq(user.id, userId)).run();
  });
  return null;
}
