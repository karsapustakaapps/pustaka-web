<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Pustaka account and database conventions

- Keep UI copy Indonesian and follow `DESIGN.md` (walnut brown, paper background, rounded buttons).
- Use named imports from `lucide-react` for UI icons. Do not use Unicode/ASCII icons or hand-written icon SVGs. Preserve the supplied brand logo asset.
- Keep each page focused on its task: direct headings, necessary labels/actions, validation, and useful empty states. Do not add decorative slogans, repeated descriptions, or implementation details to product screens. Login/signup contain only the brand, heading, form, and account-switch link.
- Email/password auth uses Better Auth through the Drizzle adapter. Do not replace it with localStorage auth or plaintext passwords. No OTP or email verification is configured.
- SQLite schema lives in `db/schema.ts`; migrations are checked into `drizzle/`. Run `npm run db:generate` after schema changes and review generated SQL before `npm run db:migrate`.
- `npm run db:setup` migrates and idempotently seeds the shared sample catalog and genres. Never seed or migrate on a web request.
- `TURSO_DATABASE_URL` selects a remote libSQL database; `TURSO_AUTH_TOKEN` supplies its database token when required. Without a URL, `DATABASE_PATH` defaults to `.data/pustaka.db` (ignored). Use the async libSQL Drizzle driver for both. Secrets belong in `.env.local`; `.env.example` documents the required variables. Local SQLite production needs a persistent writable volume; all production deployments need HTTPS.
- `/masuk` and `/daftar` are public account pages. `/minat` and `/pustakaku` validate the database session on the server. Every preference mutation must call `requireUser()`; derive user IDs from the session, never the submitted form.
- Genres are shared through `book_genres` and `user_genres`; onboarding completion is server-owned. Incomplete readers must choose interests before accessing `/pustakaku`.
- Cache Components is enabled: keep request/session reads behind Suspense and never put authenticated data in a shared cache.
- Run `npm run test:auth`, `npm run lint`, and `npm run build` for auth changes. Auth checks use an isolated temporary database.
- `users.role` is server-owned (`reader` or `admin`). Public signup/profile updates must never set it. `/admin` calls `requireAdmin()`, which checks the current database role; hiding a link is not authorization.
- Create the initial admin with `npm run admin:create` and private `ADMIN_EMAIL`/`ADMIN_PASSWORD` environment variables. Never hardcode credentials, overwrite an existing password, or automatically promote a reader. Admin bootstrap bypasses genre onboarding only for the new admin.
- Registration requires `passwordConfirmation` in the request body; validate equality on both client and server and never store the confirmation.
- `reading_entries` holds one editable status/rating/review per user and book. Save actions derive user IDs from `requireUser()`. Ratings are whole stars (1–5), optional; reviews are plain text up to 2,000 characters. Unrated entries do not affect averages.
- After reading-entry changes, revalidate the book detail, `/pustakaku`, and `/admin`. Keep public review queries limited to display names and review fields; never expose emails or phone numbers there.
- Usernames are required at signup, normalized to lowercase (3–30 ASCII letters, digits, or underscores), and database-unique. Reserve application route names. Existing accounts receive `pembaca_<rowid>` in the additive migration; never rebuild `users` with cascades enabled. The column default exists for that SQLite migration; application writes always supply a validated username.
- `/pustakaku` redirects the authenticated, onboarded reader to `/{username}`. Profiles show a placeholder avatar, name, username, genres, and current reading entries. Do not add avatar uploads or a separate interest-edit link.
- `/profil/edit` reads and mutates only the session owner. Validate name, username, genres, and the history boolean together in one transaction. Never accept a submitted user ID or role. Revalidate old/new profile URLs after a rename and the author's profile after reading/preference changes.
- `users.publicHistory` defaults to false. Public profile queries explicitly select safe fields and fetch reading activity only for the owner or when enabled; never send hidden activity to visitors. This setting controls profile history; reviews and ratings on book pages remain public, as disclosed in the edit form.
