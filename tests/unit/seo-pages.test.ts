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

  assert.match(guidePage, /Rainbow Magic Fairy Guide: Names, Books & Series/);
  assert.match(guideRoute, /FAQPage/);
  assert.match(guidePage, /name === "Specials" \? 1 : 0/);
  assert.match(guidePage, /to="\/fairy-names"/);
  assert.match(guidePage, /to="\/books"/);
  assert.match(booksPage, /Printable checklist/);
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

test("Rainbow Magic fairy guide: primary intent and accessible link text stay explicit", async () => {
  const [route, page] = await Promise.all([
    readSource("app/routes/rainbow-magic-fairy.tsx"),
    readSource("app/features/fairy-finder/rainbow-magic-fairy-page.tsx"),
  ]);

  assert.match(route, /Rainbow Magic Fairy Guide/);
  assert.match(page, /Rainbow Magic Fairy Guide: Names, Books & Series/);
  assert.match(page, /What Is a Rainbow Magic Fairy\?/);
  assert.match(page, /How to Use This Rainbow Magic Fairy Guide/);
  assert.match(page, /Rainbow Magic Fairy Series and Catalog Sections/);
  assert.match(page, /Rainbow Magic Fairy FAQ/);
  assert.match(page, /aria-label=\{`View \$\{group\.name\} series checklist`\}/);
  assert.match(page, /guide-series-checklist-label::after\s*\{\s*content:\s*"View series checklist"/s);
  assert.match(page, /guide-publisher-listings-label::after\s*\{\s*content:\s*"publisher listings organised around"/s);
  assert.match(page, /guide-listing-count-label::after\s*\{\s*content:\s*" listings"/s);
  assert.match(page, /guide-listing-count-label\.is-singular::after\s*\{\s*content:\s*" listing"/s);
  assert.match(page, /guide-theme-label::after\s*\{\s*content:\s*"theme"/s);
  assert.match(page, /aria-label=\{`\$\{group\.cardCount\} catalog entries`\}/);
  assert.doesNotMatch(page, />View series checklist\s*</);
  assert.doesNotMatch(page, /`\$\{cardCount\} publisher listings/);
  assert.doesNotMatch(page, /group\.cardCount === 1 \? "listing" : "listings"/);
  assert.doesNotMatch(page, /return `the \$\{name\.replace\(\/\^The \/, ""\)\} theme\.`/);
});

test("Books page: directory-first information architecture and verified counts stay explicit", async () => {
  const [route, page, checklist] = await Promise.all([
    readSource("app/routes/books.tsx"),
    readSource("app/features/fairy-finder/books-page.tsx"),
    readSource("app/features/fairy-finder/components/book-checklist.tsx"),
  ]);

  assert.match(route, /Rainbow Magic Books List & Printable Checklist/);
  assert.match(page, /Rainbow Magic Books: Complete List in Series Order/);
  assert.match(page, /Book guide.*Series order.*Printable checklist/s);
  assert.match(page, /Rainbow Magic books at a glance/);
  assert.match(page, /How to read Rainbow Magic books in order/);
  assert.match(page, /Browse Rainbow Magic books/);
  assert.match(page, /Search the Rainbow Magic books list/);
  assert.match(page, /Read Rainbow Magic books in order/);
  assert.match(page, /Print the Rainbow Magic books checklist/);
  assert.match(page, /Related tools/);

  assert.match(checklist, /Search by book title or fairy name/);
  assert.match(checklist, /Catalog status/);
  assert.match(checklist, /Reading status/);
  assert.match(checklist, /Region \/ title/);
  assert.match(checklist, /AFFILIATE_ENABLED\s*=\s*false/);
  assert.match(checklist, /beforeprint/);
  assert.match(checklist, /afterprint/);
});

test("Books page: repeated control labels use accessible CSS-generated presentation", async () => {
  const checklist = await readSource(
    "app/features/fairy-finder/components/book-checklist.tsx"
  );

  assert.match(checklist, /catalog-details-trigger::after\s*\{\s*content:\s*"View details"/s);
  assert.match(checklist, /catalog-reading-status::after\s*\{\s*content:\s*"To read"/s);
  assert.match(checklist, /catalog-reading-status\.is-read::after\s*\{\s*content:\s*"Read"/s);
  assert.match(checklist, /catalog-group-status\.is-current::after\s*\{\s*content:\s*"Current catalog"/s);
  assert.match(checklist, /catalog-group-status\.is-archive::after\s*\{\s*content:\s*"Archive"/s);
  assert.match(checklist, /catalog-record-status\.is-current\.is-unread::after\s*\{\s*content:\s*"Current catalog · Unread"/s);
  assert.match(checklist, /catalog-record-status\.is-archive\.is-read::after\s*\{\s*content:\s*"Archive edition · Read"/s);
  assert.match(checklist, /aria-label=\{`View details for \$\{book\.title\}`\}/);
  assert.match(checklist, /role="status" aria-label=\{isComplete \? "Read" : "To read"\}/);
  assert.match(checklist, /aria-label=\{isComplete \? "Read" : "To read"\}/);
  assert.match(checklist, /aria-hidden className=\{clsx\("catalog-group-status/);
  assert.match(checklist, /aria-hidden className=\{clsx\("catalog-record-status/);
  assert.doesNotMatch(checklist, />View details\s*</);
  assert.doesNotMatch(checklist, />\{isComplete \? "Read" : "To read"\}<\/span>/);
  assert.doesNotMatch(checklist, />\{group\.sourceKind === "official-current" \? "Current catalog" : "Archive"\}<\/span>/);
});

test("Books page: SEO audit measures SSR-visible weighted phrase coverage", async () => {
  const [packageJson, auditScript, route] = await Promise.all([
    readSource("package.json"),
    readSource("scripts/audit-books-seo.mjs"),
    readSource("app/routes/books.tsx"),
  ]);

  assert.match(packageJson, /"audit:books-seo"\s*:\s*"node scripts\/audit-books-seo\.mjs"/);
  assert.match(auditScript, /MIN_DENSITY\s*=\s*3\.5/);
  assert.match(auditScript, /MAX_DENSITY\s*=\s*5/);
  assert.match(auditScript, /script\|style\|noscript/);
  assert.match(auditScript, /coveredKeywordWords \/ tokens\.length/);
  assert.match(route, /"@type": "FAQPage"/);
  assert.match(route, /updatedAt: "2026-08-01"/);
});
