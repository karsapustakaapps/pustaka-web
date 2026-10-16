import "./load-env";
import { db, sqlite } from "../db";
import { genres } from "../db/schema";
import { initialGenres } from "../lib/genre-data";

async function main() {
  await db.insert(genres).values([...initialGenres]).onConflictDoNothing().run();
  console.log("Genre awal siap digunakan.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => sqlite.close());
