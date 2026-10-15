import assert from "node:assert/strict";
import { createServer } from "node:http";
import { sql } from "drizzle-orm";

async function main() {
  let authorization: string | undefined;
  const server = createServer(async (request, response) => {
    authorization = request.headers.authorization;
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const pipeline = JSON.parse(Buffer.concat(chunks).toString());
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      baton: null,
      base_url: null,
      results: pipeline.requests.map((command: { type: string }) => ({
        type: "ok",
        response: command.type === "close" ? { type: "close" } : {
          type: "execute",
          result: { cols: [{ name: "value", decltype: "INTEGER" }], rows: [[{ type: "integer", value: "1" }]], affected_row_count: 0, last_insert_rowid: null },
        },
      })),
    }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    // Plain HTTP is limited to this local protocol stub; real Turso URLs use TLS.
    process.env.TURSO_DATABASE_URL = `libsql://127.0.0.1:${address.port}?tls=0&authToken=test-url-token`;
    delete process.env.TURSO_AUTH_TOKEN;
    const { db, sqlite } = await import("../db");
    try {
      assert.deepEqual(await db.get(sql`select 1 as value`), { value: 1 });
      assert.equal(authorization, "Bearer test-url-token", "A single libsql URL supplies authentication to the remote driver");
    } finally {
      sqlite.close();
    }
    console.log("Connection check passed: a single libsql URL connects remotely and supplies its database token.");
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
