import { and, asc, avg, count, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { books, bookGenres, genres, readingEntries } from "@/db/schema";

type SearchParams = Record<string, string | string[] | undefined>;
export const catalogPageSize = 24;

export async function getCatalog(params: SearchParams) {
  const availableGenres = await db.select({ id: genres.id, name: genres.name }).from(genres).orderBy(asc(genres.name)).all();
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  const genre = typeof params.genre === "string" && availableGenres.some((item) => item.id === params.genre) ? params.genre : "";
  const sort = params.sort === "ratings" ? "ratings" : "rating";
  const requestedPage = typeof params.page === "string" && /^[1-9]\d*$/.test(params.page) && Number.isSafeInteger(Number(params.page)) ? Number(params.page) : 1;
  const pattern = `%${query.replace(/[!%_]/g, "!$&")}%`;
  const where = and(
    query ? or(sql`${books.title} like ${pattern} escape '!'`, sql`${books.author} like ${pattern} escape '!'`) : undefined,
    genre ? inArray(books.id, db.select({ bookId: bookGenres.bookId }).from(bookGenres).where(eq(bookGenres.genreId, genre))) : undefined,
  );
  const total = (await db.select({ count: count() }).from(books).where(where).get())!.count;
  const pages = Math.max(1, Math.ceil(total / catalogPageSize));
  const page = Math.min(requestedPage, pages);
  const ratings = db.select({ bookId: readingEntries.bookId, average: avg(readingEntries.rating).as("average"), ratings: count(readingEntries.rating).as("ratings") })
    .from(readingEntries).groupBy(readingEntries.bookId).as("book_ratings");
  const ratingCount = sql<number>`coalesce(${ratings.ratings}, 0)`;
  const byRating = [desc(ratings.average), desc(ratingCount)];
  const results = await db.select({ id: books.id, title: books.title, author: books.author, cover: books.cover, average: ratings.average, ratings: ratingCount })
    .from(books).leftJoin(ratings, eq(ratings.bookId, books.id)).where(where)
    .orderBy(...(sort === "ratings" ? [desc(ratingCount), desc(ratings.average)] : byRating), asc(sql`${books.title} collate nocase`), asc(books.id))
    .limit(catalogPageSize).offset((page - 1) * catalogPageSize).all();
  return { books: results, genres: availableGenres, query, genre, sort, total, page, pages };
}
