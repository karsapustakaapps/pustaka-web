# Pustaka

Next.js application for discovering ebooks, with Indonesian UI, email/password accounts, reader profiles, and reading activity. The landing page uses Lenis and Motion; interface icons use Lucide React. Page copy stays focused on the task, with direct headings and necessary labels, feedback, and actions.

## Local setup

```sh
npm install
```

Copy `.env.example` to `.env.local`. Generate a private secret and place it in `BETTER_AUTH_SECRET`:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Set `BETTER_AUTH_URL` to your application origin (`http://localhost:3000` locally), then:

```sh
npm run db:setup
npm run dev
```

`db:setup` applies committed Drizzle migrations and idempotently seeds six genres. Books are added through the admin dashboard. It never replaces existing books, reader accounts, or preferences. Without a database URL, the local SQLite database is `.data/pustaka.db`, configurable with `DATABASE_PATH`.

## Turso

Set `TURSO_DATABASE_URL` in `.env.local` to use a remote libSQL database instead of the local file. For a single environment setting, include the database token in the URL:

```env
TURSO_DATABASE_URL="libsql://your-database.turso.io?authToken=your-database-auth-token"
```

`TURSO_DATABASE_URL` takes precedence over `DATABASE_PATH`. You can alternatively use the bare `libsql://` URL and put the token in `TURSO_AUTH_TOKEN`. The separate token is optional when the URL already includes it or the database allows unauthenticated access. Standard Turso databases require a database token; a bare URL does not grant access. Treat a URL containing a token as a secret. Keep both settings server-only (no `NEXT_PUBLIC_` prefix). Generate a database token through the Turso dashboard or `turso db tokens create your-database`.

For an empty Turso database, run `npm run db:setup` once, then `npm run dev`. The migration, seed, admin bootstrap, and Studio commands all use the configured database. Existing local accounts, preferences, and reading entries are not uploaded automatically; transfer the local database separately if you need them. See the [Turso SDK guide](https://docs.turso.tech/sdk/ts/quickstart) and [Drizzle Turso guide](https://orm.drizzle.team/docs/get-started/turso-new).

Every page uses the root navbar with Beranda, Jelajahi buku, Cara kerja, and account actions. Signed-in readers use the circular Profil saya icon to reach their profile through the session/onboarding gate. Secondary buttons use a filled parchment background.

## Account flow

- `/daftar`: full name, unique username, email, phone number, password (8-128 characters), and matching password confirmation. Usernames use 3–30 letters, digits, or underscores and are normalized to lowercase. Registration signs the reader in.
- `/masuk`: email and password. Better Auth hashes passwords, manages seven-day database sessions, checks request origins, and limits repeated login attempts.
- `/minat`: authenticated readers select one or more genres from the database. Preferences persist and can be changed later.
- `/pustakaku`: requires a valid session and completed onboarding; redirects to the reader's `/{username}` profile.
- `/{username}`: public name, placeholder avatar, username, and reading interests. Activity lists saved reading statuses, stars, reviews, and update dates. History starts private; only the owner sees it until they enable public history.
- `/profil/edit`: session-protected edits to name, username, genres, and public profile history. Changing the username changes the profile URL; the old URL is no longer assigned to that account. Book-page reviews and ratings remain public independently of profile history.
- `/buku`: public book discovery with live title/author search, shared genre filters, highest average rating or most ratings sorting, and 24 books per page. Typing and genre/sorting changes update results automatically; Cari also submits the search. Live updates replace the URL and reset pagination; unrated books follow rated books, and ties use rating count then title. All pages use Plus Jakarta Sans.
- `/buku/[slug]`: public book detail, average star rating, and recent reviews. Signed-in readers can save one editable entry per book: reading status, optional 1-5 star rating, and optional review (up to 2,000 characters).
- `/admin`: server-protected overview of books, ratings, latest accounts, and reviews, with Tambah buku and Edit actions. Only database users with the `admin` role can access it.
- `/admin/buku/baru` and `/admin/buku/[id]`: create or edit a book's title, author, cover, description, unique positive Project Gutenberg ID, and 1–20 shared genres. Covers use an existing `/books/filename.jpg` asset or an HTTPS image URL; external images load directly in the browser. Edits keep book URLs and reading entries intact. Hapus buku on the edit page requires confirmation and permanently deletes the book and its related reading entries, ratings, and reviews. Every mutation rechecks the current database admin role, saves genre changes atomically, and refreshes the catalog, detail, admin, and profile pages.

`db/schema.ts` defines `users`, `accounts`, `sessions`, `verifications`, `rate_limits`, `books`, `genres`, `book_genres`, `user_genres`, and `reading_entries`. Ratings have database checks and one entry per user/book; unrated entries do not affect averages. The catalog is managed through the admin dashboard. Static book examples for the landing page live in `lib/catalog-data.ts`; initial genres live in `lib/genre-data.ts`.

## Initial admin

Set `ADMIN_EMAIL` and a strong, unique `ADMIN_PASSWORD` in `.env.local`, then run:

```sh
npm run db:migrate
npm run admin:create
```

Sign in through `/masuk`; admins are directed to `/admin`. Local development has an initial `admin@pustaka.local` account with a randomly generated password stored as `ADMIN_PASSWORD` in the ignored `.env.local`. `ADMIN_NAME`, `ADMIN_USERNAME` (default `admin_pustaka`), and `ADMIN_PHONE` are optional bootstrap settings.

This command creates a new admin, leaves an existing admin unchanged, and refuses to promote an existing reader. It never resets an existing password. Public signup and profile update requests cannot set roles. The admin dashboard supports book CRUD; review moderation is not included.

The profile migration assigns existing readers unique `pembaca_<rowid>` usernames, which they can change in Edit profil. It adds columns in place and preserves existing credentials, sessions, preferences, and reading entries. Profile mutations save all fields and genres atomically; the database's unique index prevents duplicate usernames.

## Development commands

```sh
npm run db:generate  # Generate migrations after editing the schema; review SQL
npm run db:migrate   # Apply committed migrations
npm run db:seed      # Add missing initial genres
npm run db:studio    # Inspect the configured local or Turso database
npm run admin:create # Create the initial admin from private environment settings
npm run test:db      # Single-URL remote connection/authentication check with a local protocol stub
npm run test:auth    # Isolated database auth/security/persistence checks
npm run test:catalog # Isolated database search/filter/ranking/pagination checks
npm run test:books   # Isolated database book CRUD/authorization/transaction checks
node scripts/check-landing.mjs # Landing check against the running local server
npm run lint
npm run build
```

## Deployment

Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in your hosting provider's private environment settings to use Turso. A remote database does not need a persistent local database volume. If using the local SQLite fallback, run on a Node.js host with a persistent writable volume, keep `DATABASE_PATH` on that volume, and back it up; an ephemeral serverless filesystem will not preserve local accounts. Set a unique production secret and the HTTPS application origin; run migrations and seed before starting the app with `npm start`. Never migrate or seed during a web request. Do not commit `.env.local` or database files.

OTP, email/phone verification, password recovery, and payments are outside this implementation. Complete sample editions open in English on Project Gutenberg.
