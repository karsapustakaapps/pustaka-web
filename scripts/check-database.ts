import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const check = process.argv[2];
if (check !== "auth" && check !== "catalog") throw new Error("Choose auth or catalog.");
const directory = mkdtempSync(join(tmpdir(), `pustaka-${check}-test-`));

try {
  // libSQL can retain native file handles on Windows until the process exits.
  const result = spawnSync(process.execPath, ["--import", "tsx", `scripts/check-${check}.ts`], {
    stdio: "inherit",
    windowsHide: true,
    env: {
      ...process.env,
      PUSTAKA_DATABASE_CHECK: check,
      DATABASE_PATH: join(directory, "test.db"),
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
    },
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  for (const file of readdirSync(directory)) unlinkSync(join(directory, file));
  rmdirSync(directory);
}
