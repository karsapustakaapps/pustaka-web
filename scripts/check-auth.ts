import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
async function main() {
  if (process.env.PUSTAKA_DATABASE_CHECK !== "auth" || !process.env.DATABASE_PATH || process.env.TURSO_DATABASE_URL || process.env.TURSO_AUTH_TOKEN) throw new Error("Use npm run test:auth with an isolated local database.");
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  process.env.BETTER_AUTH_SECRET = randomBytes(48).toString("base64url");
  const { db, sqlite } = await import("../db");
  const { user, account, genres, userGenres, books, bookGenres, session, rateLimit, readingEntries } = await import("../db/schema");
  try {
    // Exercise the upgrade with real foreign-key references, not only an empty database.
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
    for (const entry of journal.entries.slice(0, 3))
      await sqlite.executeMultiple(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
    await sqlite.executeMultiple(`
    CREATE TABLE __drizzle_migrations (id INTEGER PRIMARY KEY, hash TEXT NOT NULL, created_at NUMERIC);
    INSERT INTO users (id, full_name, email, phone_number, created_at, updated_at) VALUES ('legacy', 'Pembaca Lama', 'legacy@example.test', '081234567890', 0, 0), ('legacy2', 'Pembaca Lama Dua', 'legacy2@example.test', '081234567890', 0, 0);
    INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('legacy-account', 'legacy', 'credential', 'legacy', 'unchanged-hash', 0, 0);
    INSERT INTO sessions (id, token, user_id, expires_at, created_at, updated_at) VALUES ('legacy-session', 'unchanged-token', 'legacy', 9999999999999, 0, 0);
    INSERT INTO genres VALUES ('legacy-genre', 'Genre lama', 'Lama');
    INSERT INTO books VALUES ('legacy-book', 'Buku lama', 'Penulis', '/test.jpg', 'Lama', 99);
    INSERT INTO user_genres VALUES ('legacy', 'legacy-genre');
    INSERT INTO reading_entries VALUES ('legacy', 'legacy-book', 'read', 4, 'Ulasan lama', 0, 0);
  `);
    await sqlite.execute({ sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)", args: ["legacy-fixture", journal.entries[2].when] });
    await migrate(db, { migrationsFolder: "./drizzle" });
    assert.deepEqual(await db.select({ username: user.username, publicHistory: user.publicHistory }).from(user).all(), [
      { username: "pembaca_1", publicHistory: false }, { username: "pembaca_2", publicHistory: false },
    ], "Existing readers receive different usernames and private history");
    assert.equal((await db.select().from(account).get())?.password, "unchanged-hash");
    assert.equal((await db.select().from(session).get())?.token, "unchanged-token");
    assert.equal((await db.select().from(userGenres).all()).length, 1);
    assert.equal((await db.select().from(readingEntries).get())?.comment, "Ulasan lama", "Upgrade preserves linked account data");
    assert.deepEqual((await sqlite.execute("PRAGMA foreign_key_check")).rows, []);
    await db.delete(user).run();
    await db.delete(genres).run();
    await db.delete(books).run();
    const { auth } = await import("../lib/auth");
    const { saveGenrePreferences } = await import("../lib/preferences");
    const { saveReadingEntry, getBookRating, getBookReviews } = await import("../lib/reading");
    const { isAdminUser } = await import("../lib/roles");
    const { createInitialAdmin } = await import("../lib/bootstrap-admin");
    const { getProfile, saveProfile } = await import("../lib/profiles");
    const credentials = { name: "Pembaca Uji", username: "Pembaca_Uji", email: "reader@example.test", phoneNumber: "+62 812-3456-7890", password: "buku-kopi-2026", passwordConfirmation: "buku-kopi-2026" };
    async function request(path: string, body?: object, cookie?: string, origin = "http://localhost:3000") {
      return auth.handler(new Request(`http://localhost:3000/api/auth/${path}`, {
        method: body ? "POST" : "GET",
        headers: { "Content-Type": "application/json", Origin: origin, "x-forwarded-for": "127.0.0.1", ...(cookie ? { Cookie: cookie } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }));
    }
    for (const invalid of [{ name: " " }, { username: "ab" }, { username: "admin" }, { username: "nama/asing" }, { username: "x".repeat(31) }, { username: undefined }, { phoneNumber: "hello" }, { phoneNumber: "123" }, { password: "short" }, { passwordConfirmation: "mismatch" }]) {
      await db.delete(rateLimit).run();
      const response = await request("sign-up/email", { ...credentials, ...invalid });
      assert.equal(response.status, 400, "Invalid registration must fail on the server");
    }
    await db.delete(rateLimit).run();
    const signup = await request("sign-up/email", { ...credentials, onboardingCompleted: true, role: "admin", publicHistory: true });
    assert.equal(signup.status, 200, "Registration should succeed");
    const result = await signup.json();
    const id = result.user.id as string;
    assert.equal(result.user.onboardingCompleted, false, "Clients cannot bypass onboarding");
    assert.equal(result.user.role, "reader", "Registration cannot grant admin privileges");
    assert.equal(result.user.username, "pembaca_uji", "Normalize usernames before storing them");
    assert.equal(result.user.publicHistory, false, "History starts private");
    assert.equal(await isAdminUser(id), false);
    assert.equal(result.user.phoneNumber, "+6281234567890");
    const storedAccount = await db.select().from(account).where(eq(account.userId, id)).get();
    assert.ok(storedAccount?.password && storedAccount.password !== credentials.password, "Store a password hash, never the password");
    const cookieHeader = signup.headers.getSetCookie().find((value) => value.includes("session_token="));
    assert.ok(cookieHeader, "Registration should set a session cookie");
    assert.ok(cookieHeader.includes("HttpOnly"));
    assert.match(cookieHeader, /SameSite=Lax/i);
    const cookie = cookieHeader.split(";")[0];
    assert.equal((await (await request("get-session", undefined, cookie)).json()).user.id, id);
    await request("update-user", { role: "admin" }, cookie);
    assert.equal(await isAdminUser(id), false, "Profile updates cannot grant admin privileges");
    assert.equal((await request("update-user", { username: "another_name", publicHistory: true }, cookie)).status, 400, "Username/privacy updates must use the validated profile action");
    assert.equal(await (await request("get-session", undefined, "better-auth.session_token=forged")).json(), null);
    assert.equal((await request("sign-in/email", { email: credentials.email, password: "wrong-password" })).status, 401);
    const duplicate = await request("sign-up/email", { ...credentials, username: "another_reader" });
    assert.ok([200, 422].includes(duplicate.status));
    assert.equal((await db.select().from(user).all()).length, 1, "Duplicate email must not create another user");
    assert.equal((await request("sign-up/email", { ...credentials, email: "duplicate@example.test", username: "PEMBACA_UJI" })).status, 400, "Usernames are unique regardless of entered case");
    assert.equal((await request("sign-in/email", credentials, undefined, "https://untrusted.example")).status, 403, "Reject cross-origin login");
    await db.insert(genres).values([
      { id: "romansa", name: "Romansa", description: "Cinta" },
      { id: "klasik", name: "Klasik", description: "Klasik" },
    ]).run();
    await db.insert(books).values({ id: "book", title: "Test", author: "Test", cover: "/test.jpg", description: "Test", gutenbergId: 1 }).run();
    await db.insert(bookGenres).values({ bookId: "book", genreId: "romansa" }).run();
    assert.ok(await saveGenrePreferences(id, []));
    assert.ok(await saveGenrePreferences(id, ["unknown"]));
    assert.equal(await saveGenrePreferences(id, ["romansa"]), null);
    assert.equal((await db.select().from(user).where(eq(user.id, id)).get())?.onboardingCompleted, true);
    assert.equal(await saveGenrePreferences(id, ["klasik"]), null);
    assert.deepEqual((await db.select().from(userGenres).where(eq(userGenres.userId, id)).all()).map((row) => row.genreId), ["klasik"], "Editing preferences replaces the old selection");
    assert.ok(await saveGenrePreferences(id, ["unknown"]));
    assert.equal((await db.select().from(userGenres).where(eq(userGenres.userId, id)).get())?.genreId, "klasik", "Invalid changes must preserve prior preferences");
    await assert.rejects(db.insert(bookGenres).values({ bookId: "book", genreId: "unknown" }).run(), (error: Error) => /FOREIGN KEY/.test(String(error.cause)));
    await assert.rejects(db.transaction(async (tx) => {
      await tx.delete(userGenres).where(eq(userGenres.userId, id)).run();
      throw new Error("Test rollback");
    }), /Test rollback/);
    assert.equal((await db.select().from(userGenres).where(eq(userGenres.userId, id)).get())?.genreId, "klasik", "Failed async transactions restore prior preferences");
    assert.ok(await saveReadingEntry(id, "book", { status: "unknown", rating: "5", comment: "" }));
    assert.ok(await saveReadingEntry(id, "book", { status: "read", rating: "6", comment: "" }));
    assert.ok(await saveReadingEntry(id, "book", { status: "read", rating: "2.5", comment: "" }));
    assert.ok(await saveReadingEntry(id, "book", { status: "read", rating: "4", comment: "x".repeat(2001) }));
    assert.ok(await saveReadingEntry(id, "missing", { status: "read", rating: "4", comment: "" }));
    assert.equal(await saveReadingEntry(id, "book", { status: "reading", rating: "0", comment: "" }), null);
    assert.equal((await getBookRating("book")).count, 0, "Unrated reading status does not count toward the average");
    assert.equal(await saveReadingEntry(id, "book", { status: "read", rating: "4", comment: "Kesan pertama." }), null);
    assert.equal(await saveReadingEntry(id, "book", { status: "read", rating: "5", comment: "Ulasan diperbarui." }), null);
    assert.equal((await db.select().from(readingEntries).all()).length, 1, "A reader has one editable entry per book");
    assert.equal(Number((await getBookRating("book")).average), 5);
    assert.equal((await getBookReviews("book"))[0].comment, "Ulasan diperbarui.");
    const admin = await createInitialAdmin({ ...credentials, username: "admin_uji", name: "Admin Uji", email: "admin@example.test" });
    assert.equal(admin.created, true);
    assert.equal(await isAdminUser(admin.id), true);
    assert.equal((await createInitialAdmin({ ...credentials, email: "admin@example.test" })).created, false, "Admin bootstrap is idempotent");
    await assert.rejects(createInitialAdmin(credentials), /akun pembaca tidak diubah/, "Bootstrap must not promote an existing reader");
    assert.equal(await saveReadingEntry(admin.id, "book", { status: "read", rating: "3", comment: "Pandangan lain." }), null);
    assert.equal(Number((await getBookRating("book")).average), 4, "Ratings from different readers contribute to the average");
    assert.equal((await getBookRating("book")).count, 2);
    assert.equal((await db.select().from(readingEntries).where(eq(readingEntries.userId, id)).get())?.rating, 5, "Another reader's entry is preserved");
    await assert.rejects(db.insert(readingEntries).values({ userId: id, bookId: "book", status: "read", rating: 6, comment: "", createdAt: new Date(), updatedAt: new Date() }).onConflictDoUpdate({ target: [readingEntries.userId, readingEntries.bookId], set: { rating: 6 } }).run(), (error: Error) => /CHECK constraint/.test(String(error.cause)), "Database also rejects invalid ratings");
    const profileInput = { name: "Nama Baru", username: "Nama_Baru", publicHistory: true, role: "admin", id: admin.id };
    assert.equal((await getProfile("pembaca_uji"))?.activity, null, "Anonymous visitors cannot access private history");
    assert.equal((await getProfile("pembaca_uji", admin.id))?.activity, null, "Other users, including admins, cannot read private profile history");
    assert.equal((await getProfile("pembaca_uji", id))?.activity?.[0].comment, "Ulasan diperbarui.", "Owners can see their own private activity");
    assert.equal((await saveProfile(id, { ...profileInput, username: "ADMIN_UJI" }, ["romansa"])).error, "Username ini sudah digunakan.");
    for (const invalid of [{ name: " " }, { username: "profil" }, { username: "../masuk" }, { publicHistory: "true" }]) {
      assert.ok((await saveProfile(id, { ...profileInput, ...invalid }, ["romansa"])).error);
    }
    assert.ok((await saveProfile(id, profileInput, ["unknown"])).error);
    assert.equal((await db.select().from(user).where(eq(user.id, id)).get())?.name, credentials.name, "Invalid profile edits are atomic");
    assert.equal((await saveProfile(id, profileInput, ["romansa"])).error, "");
    assert.equal(await isAdminUser(id), false, "Profile forms cannot set the role or target another user");
    assert.equal((await db.select().from(user).where(eq(user.id, admin.id)).get())?.name, "Admin Uji");
    assert.equal(await getProfile("pembaca_uji"), null, "Renaming removes the old profile URL");
    const publicProfile = (await getProfile("nama_baru"))!;
    assert.equal(publicProfile.name, "Nama Baru");
    assert.equal(publicProfile.interests[0].id, "romansa");
    assert.equal(publicProfile.activity?.[0].rating, 5);
    assert.equal(publicProfile.activity?.[0].comment, "Ulasan diperbarui.");
    assert.ok(!("email" in publicProfile) && !("phoneNumber" in publicProfile) && !("id" in publicProfile), "Public profile data excludes private account fields");
    assert.equal((await getBookReviews("book")).find((review) => review.userId === id)?.username, "nama_baru", "Review author links follow the new username");
    assert.equal((await (await request("get-session", undefined, cookie)).json()).user.username, "nama_baru", "Sessions use the latest profile data");
    await assert.rejects(db.update(user).set({ username: "admin_uji" }).where(eq(user.id, id)).run(), (error: Error) => /UNIQUE constraint/.test(String(error.cause)), "The database also enforces username uniqueness");
    assert.equal((await saveProfile(id, { ...profileInput, publicHistory: false }, ["romansa"])).error, "");
    assert.equal((await getProfile("nama_baru"))?.activity, null, "Turning history off hides it immediately");
    assert.equal((await getProfile("nama_baru", id))?.activity?.length, 1, "Privacy changes preserve saved reading entries");
    assert.equal((await request("sign-out", {}, cookie)).status, 200);
    assert.equal(await (await request("get-session", undefined, cookie)).json(), null, "Logout revokes the session");
    const signin = await request("sign-in/email", { email: credentials.email.toUpperCase(), password: credentials.password });
    assert.equal(signin.status, 200, "Returning users can log in, including uppercase email");
    const newCookie = signin.headers.getSetCookie().find((value) => value.includes("session_token="))!.split(";")[0];
    await db.update(session).set({ expiresAt: new Date(0) }).where(eq(session.userId, id)).run();
    assert.equal(await (await request("get-session", undefined, newCookie)).json(), null, "Expired sessions are rejected");
    await db.delete(rateLimit).run();
    const attempts = await Promise.all(Array.from({ length: 6 }, () => request("sign-in/email", { email: credentials.email, password: "wrong-password" })));
    assert.ok(attempts.some((response) => response.status === 429), "Concurrent login attempts are rate limited");
    await db.delete(user).where(eq(user.id, id)).run();
    assert.equal((await db.select().from(userGenres).all()).length, 0, "User deletion cascades to preferences");
    assert.equal((await db.select().from(readingEntries).where(eq(readingEntries.userId, id)).all()).length, 0, "User deletion cascades to reading entries");
    console.log("Checks passed: safe legacy migration, unique usernames, profile edits/privacy, password confirmation, auth/sessions/CSRF, genres, admin protection, ratings/reviews, constraints, and rate limiting.");
  } finally {
    sqlite.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
