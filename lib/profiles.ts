import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { books, genres, readingEntries, user, userGenres } from "@/db/schema";
import { fullNameSchema, usernameSchema } from "./auth-validation";
import { validateGenrePreferences } from "./preferences";

const profileSchema = z.object({ name: fullNameSchema, username: usernameSchema, publicHistory: z.boolean() });

export async function saveProfile(userId: string, input: unknown, values: FormDataEntryValue[]) {
  const result = profileSchema.safeParse(input);
  if (!result.success) return { error: result.error.issues[0].message };
  const preferences = await validateGenrePreferences(values);
  if (preferences.error) return { error: preferences.error };
  const existing = await db.select({ id: user.id }).from(user)
    .where(and(eq(user.username, result.data.username), ne(user.id, userId))).get();
  if (existing) return { error: "Username ini sudah digunakan." };
  try {
    await db.transaction(async (tx) => {
      const updated = await tx.update(user).set({ ...result.data, onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(user.id, userId)).returning({ id: user.id }).get();
      if (!updated) throw new Error("Profile not found");
      await tx.delete(userGenres).where(eq(userGenres.userId, userId)).run();
      await tx.insert(userGenres).values(preferences.ids.map((genreId) => ({ userId, genreId }))).run();
    });
  } catch (error) {
    // The unique constraint also covers two readers claiming a username at the same time.
    if (await db.select({ id: user.id }).from(user).where(and(eq(user.username, result.data.username), ne(user.id, userId))).get()) return { error: "Username ini sudah digunakan." };
    throw error;
  }
  return { error: "", username: result.data.username };
}

export async function getProfile(username: string, viewerId?: string) {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) return null;
  const profile = await db.select({ id: user.id, name: user.name, username: user.username, publicHistory: user.publicHistory })
    .from(user).where(eq(user.username, parsed.data)).get();
  if (!profile) return null;
  const isOwner = viewerId === profile.id;
  const interests = await db.select({ id: genres.id, name: genres.name }).from(genres)
    .innerJoin(userGenres, eq(userGenres.genreId, genres.id)).where(eq(userGenres.userId, profile.id)).all();
  // Private activity is never queried or sent to visitors, including through the React payload.
  const activity = profile.publicHistory || isOwner ? await db.select({
    bookId: books.id, title: books.title, author: books.author, cover: books.cover,
    status: readingEntries.status, rating: readingEntries.rating, comment: readingEntries.comment, updatedAt: readingEntries.updatedAt,
  }).from(readingEntries).innerJoin(books, eq(books.id, readingEntries.bookId))
    .where(eq(readingEntries.userId, profile.id)).orderBy(desc(readingEntries.updatedAt)).all() : null;
  return { name: profile.name, username: profile.username, publicHistory: profile.publicHistory, isOwner, interests, activity };
}
