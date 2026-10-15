import "./load-env";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db, sqlite } from "../db";

async function main() {
  if (!process.env.TURSO_DATABASE_URL?.trim()) await sqlite.execute("PRAGMA journal_mode = WAL");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrasi Pustaka selesai.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => sqlite.close());
