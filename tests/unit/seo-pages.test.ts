import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  BOOK_CATALOG_GROUPS,
  BOOK_CATALOG_RECORD_COUNT,
  OFFICIAL_CATALOG_CARD_COUNT,
  OFFICIAL_CATALOG_GROUP_COUNT,
  OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT,
} from "../../app/features/fairy-finder/data/book-catalog.js";

const readSource = (path: string) => readFile(path, "utf8");

test("Book catalog: all 324 local cover records are assigned exactly once", () => {
  assert.equal(OFFICIAL_CATALOG_GROUP_COUNT, 39);
  assert.equal(OFFICIAL_CATALOG_CARD_COUNT, 299);
  assert.equal(OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT, 296);
  assert.equal(BOOK_CATALOG_RECORD_COUNT, 324);
  assert.equal(BOOK_CATALOG_GROUPS.length, 41);
  assert.equal(BOOK_CATALOG_GROUPS[0]?.name, "The Rainbow Fairies");
  assert.equal(BOOK_CATALOG_GROUPS.at(-1)?.name, "Rainbow Magic Reference Books");

  const catalogTitles = BOOK_CATALOG_GROUPS.flatMap((group) => group.books.map((book) => book.catalogTitle));
  const localTitles = [...readFileSync("app/features/fairy-finder/data/fairies.ts", "utf8").matchAll(/fullTitle:\s*"([^"]+)"/g)].map((match) => match[1]);

  assert.equal(catalogTitles.length, 324);
  assert.equal(new Set(catalogTitles).size, 324);
  assert.deepEqual([...catalogTitles].sort(), [...localTitles].sort());

  for (const group of BOOK_CATALOG_GROUPS) {
    assert.ok(group.books.length > 0);
    assert.match(group.id, /^[a-z0-9-]+$/);
    for (const book of group.books) {
      assert.ok(book.id);
      assert.ok(book.title);
      assert.ok(book.catalogTitle);
    }
  }
});

test("SEO reading pages: routes, sitemap, and cross-links stay discoverable", async () => {
  const [routes, sitemap, guideRoute, guidePage, booksRoute, booksPage, navigation] = await Promise.all([
    readSource("app/routes.ts"),
    readSource("app/routes/_meta/[sitemap.xml].tsx"),
    readSource("app/routes/rainbow-magic-fairy.tsx"),
    readSource("app/features/fairy-finder/rainbow-magic-fairy-page.tsx"),
    readSource("app/routes/books.tsx"),
    readSource("app/features/fairy-finder/books-page.tsx"),
    readSource("app/features/fairy-finder/i18n.ts"),
  ]);

  for (const path of ["rainbow-magic-fairy", "books"]) {
    assert.match(routes, new RegExp(`route\\(\"${path}\"`));
    assert.match(sitemap, new RegExp(`/${path}`));
    assert.match(navigation, new RegExp(`/${path}`));
  }

  assert.match(guidePage, /Rainbow Magic Fairies — Complete Guide/);
  assert.match(guideRoute, /FAQPage/);
  assert.match(guidePage, /name === "Specials" \? 1 : 0/);
  assert.match(guidePage, /to="\/fairy-names"/);
  assert.match(guidePage, /to="\/books"/);
  assert.match(booksPage, /Reading Checklist/);
  assert.match(booksPage, /BookChecklist/);
  assert.match(`${booksRoute}\n${booksPage}`, /fan-made/i);
});

test("SEO reading pages: no affiliate links are emitted without verified product data", async () => {
  const [booksRoute, booksPage, checklist, data] = await Promise.all([
    readSource("app/routes/books.tsx"),
    readSource("app/features/fairy-finder/books-page.tsx"),
    readSource("app/features/fairy-finder/components/book-checklist.tsx"),
    readSource("app/features/fairy-finder/data/book-catalog.ts"),
  ]);

  for (const source of [booksRoute, booksPage, checklist, data]) {
    assert.doesNotMatch(source, /amazon\.(co\.uk|com)\/dp\//i);
    assert.doesNotMatch(source, /rel="nofollow sponsored"/i);
  }
});
