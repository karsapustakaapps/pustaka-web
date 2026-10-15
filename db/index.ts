import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as schema from "./schema";

// The database is runtime storage, not a file to bundle into the deployment.
const databaseUrl = process.env.TURSO_DATABASE_URL?.trim();
const databasePath = resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH || ".data/pustaka.db");
if (!databaseUrl) mkdirSync(dirname(databasePath), { recursive: true });

const globalDb = globalThis as typeof globalThis & { pustakaLibsql?: Client };
export const sqlite = globalDb.pustakaLibsql ?? createClient({
  url: databaseUrl || pathToFileURL(databasePath).href,
  authToken: databaseUrl ? process.env.TURSO_AUTH_TOKEN?.trim() || undefined : undefined,
  timeout: 5000,
});
if (process.env.NODE_ENV !== "production") globalDb.pustakaLibsql = sqlite;

export const db = drizzle(sqlite, { schema });
