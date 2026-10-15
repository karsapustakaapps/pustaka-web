import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  dialect: "turso",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL?.trim() || pathToFileURL(resolve(process.env.DATABASE_PATH || ".data/pustaka.db")).href,
    authToken: process.env.TURSO_DATABASE_URL?.trim() ? process.env.TURSO_AUTH_TOKEN?.trim() || undefined : undefined,
  },
});
