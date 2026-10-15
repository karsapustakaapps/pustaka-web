import assert from "node:assert/strict";

const base = process.argv[2] || "http://localhost:3000";
const response = await fetch(base);
assert.equal(response.status, 200, "Landing page must load");
const html = await response.text();
assert.match(html, /<title>Pustaka/);
assert.match(
  html,
  /<html[^>]*lang="id"/,
  "The page language should be Indonesian",
);
assert.equal(
  [...html.matchAll(/class="book-card"/g)].length,
  0,
  "Book discovery should live on its own page",
);
assert.match(html, /href="\/buku"/, "The landing page must link to book discovery");
assert.doesNotMatch(html, /href="(?:\/#discover|#discover)"/, "Discovery links must point to the dedicated page");
const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
assert.ok(header, "The shared navbar must render");
assert.equal([...html.matchAll(/<header class="site-header">/g)].length, 1, "Render only one site navbar");
for (const path of ["/buku", "/masuk", "/daftar", "/buku/pride-and-prejudice", "/halaman-uji-tidak-ada"]) {
  const page = await fetch(new URL(path, base));
  const content = await page.text();
  assert.equal([...content.matchAll(/<header class="site-header">/g)].length, 1, `${path} must render one shared navbar`);
  assert.equal(content.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0], header, `${path} must use the same navbar`);
  assert.match(content, /id="main"/, `${path} must support the shared skip link`);
  if (path === "/buku") {
    assert.match(content, />Cari<\/button>/, "Book search uses the Cari action");
    assert.doesNotMatch(content, /Tampilkan buku/, "The old search action is removed");
  }
}
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(
    html.includes(`id="${target}"`),
    `Missing anchor target: ${target}`,
  );
}
const hero = html.match(/<section[^>]*id="top"[^>]*>([\s\S]*?)<\/section>/);
assert.ok(hero, "The hero should render");
const marqueeCovers = [...hero[1].matchAll(/<img[^>]+src="([^"]+)"/g)].map(
  ([, src]) => src,
);
assert.equal(
  marqueeCovers.length,
  21,
  "The marquee needs enough copies to cover wide screens",
);
const firstSequence = marqueeCovers.slice(0, 7);
assert.equal(
  new Set(firstSequence).size,
  7,
  "The marquee should contain seven distinct covers",
);
for (let start = 7; start < marqueeCovers.length; start += 7) {
  assert.deepEqual(
    marqueeCovers.slice(start, start + 7),
    firstSequence,
    "Cover order must repeat exactly for a seamless loop",
  );
}
assert.equal(
  [...hero[1].matchAll(/class="marquee-group"[^>]*aria-hidden="true"/g)].length,
  2,
  "Duplicated covers should be hidden from screen readers",
);
const covers = new Set(
  [...html.matchAll(/<img[^>]+src="([^"]+)"/g)]
    .map(([, src]) =>
      new URL(src.replaceAll("&amp;", "&"), base).searchParams.get("url"),
    )
    .filter(Boolean),
);
assert.equal(covers.size, 7, "All seven cover assets should appear");
for (const cover of covers) {
  const image = await fetch(new URL(cover, base));
  assert.equal(image.status, 200, `Missing cover: ${cover}`);
  assert.match(image.headers.get("content-type"), /^image\//);
  assert.ok(
    (await image.arrayBuffer()).byteLength > 1000,
    `Empty cover: ${cover}`,
  );
}
console.log(
  "Landing check passed: shared navbar across pages, search action, metadata, discovery links, anchors, cover assets, and seamless marquee sequences.",
);
