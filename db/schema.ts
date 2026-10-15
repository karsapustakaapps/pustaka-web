import { sql } from "drizzle-orm";
import { check, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("full_name").notNull(),
  // The constant default allows SQLite to add this column without rebuilding users and cascading their data.
  username: text("username").notNull().default("pembaca").unique(),
  publicHistory: integer("public_history", { mode: "boolean" }).notNull().default(false),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  phoneNumber: text("phone_number").notNull(),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).notNull().default(false),
  role: text("role", { enum: ["reader", "admin"] }).notNull().default("reader"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const session = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
}, (table) => [index("sessions_user_idx").on(table.userId)]);

export const account = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
  scope: text("scope"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("accounts_user_idx").on(table.userId)]);

export const verification = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("verifications_identifier_idx").on(table.identifier)]);

export const rateLimit = sqliteTable("rate_limits", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("last_request").notNull(),
});

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  cover: text("cover").notNull(),
  description: text("description").notNull(),
  gutenbergId: integer("gutenberg_id").notNull().unique(),
});

export const genres = sqliteTable("genres", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
});

export const bookGenres = sqliteTable("book_genres", {
  bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  genreId: text("genre_id").notNull().references(() => genres.id, { onDelete: "cascade" }),
}, (table) => [
  primaryKey({ columns: [table.bookId, table.genreId] }),
  index("book_genres_genre_idx").on(table.genreId),
]);

export const userGenres = sqliteTable("user_genres", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  genreId: text("genre_id").notNull().references(() => genres.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.userId, table.genreId] })]);

export const readingEntries = sqliteTable("reading_entries", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["want_to_read", "reading", "read"] }).notNull().default("want_to_read"),
  rating: integer("rating"),
  comment: text("comment").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.bookId] }),
  index("reading_entries_book_idx").on(table.bookId),
  check("reading_status_valid", sql`${table.status} in ('want_to_read', 'reading', 'read')`),
  check("reading_rating_valid", sql`${table.rating} is null or (${table.rating} between 1 and 5 and typeof(${table.rating}) = 'integer')`),
  check("reading_comment_length", sql`length(${table.comment}) <= 2000`),
]);
