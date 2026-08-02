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
  type BookCatalogGroup,
} from "../../app/features/fairy-finder/data/book-catalog.js";
import {
  AMAZON_UK_ASSOCIATE_TAG,
  AMAZON_UK_PURCHASE_COUNT,
  getAmazonUkPurchase,
} from "../../app/features/fairy-finder/data/amazon-purchases.js";
import { FAIRY_LIST } from "../../app/features/fairy-finder/data/fairies.js";

const readSource = (path: string) => readFile(path, "utf8");

const REMOVED_NON_CATALOG_TITLES = [
  "My A to Z of Fairies",
  "Rainbow Magic Beginner Reader: A Fairy Ballet",
  "Rainbow Magic Beginner Reader: A Magical Birthday Surprise",
  "Rainbow Magic Beginner Reader: Pet Parade",
  "Rainbow Magic Beginner Reader: The Fairy Treasure Hunt",
  "Rainbow Magic Beginner Reader: The Fairyland Costume Ball",
  "Rainbow Magic Beginner Reader: The Pet Keeper Fairies",
  "Rainbow Magic Beginner Reader: The Rainbow Fairies",
  "Rainbow Magic Beginner Reader: The Weather Fairies",
  "Rainbow Magic Early Reader: Alexandra the Royal Baby Fairy",
  "Rainbow Magic Early Reader: Belle the Birthday Fairy",
  "Rainbow Magic Early Reader: Catherine the Fashion Princess Fairy",
  "Rainbow Magic Early Reader: Charlotte the Baby Princess Fairy",
  "Rainbow Magic Early Reader: Destiny the Pop Star Fairy",
  "Rainbow Magic Early Reader: Flora the Fancy Dress Fairy",
  "Rainbow Magic Early Reader: Florence the Friendship Fairy",
  "Rainbow Magic Early Reader: Frances the Royal Family Fairy",
  "Rainbow Magic Early Reader: Georgie the Royal Prince Fairy",
  "Rainbow Magic Early Reader: Holly the Christmas Fairy",
  "Rainbow Magic Early Reader: Kate the Royal Wedding Fairy",
  "Rainbow Magic Early Reader: Keira the Film Star Fairy",
  "Rainbow Magic Early Reader: Kylie the Carnival Fairy",
  "Rainbow Magic Early Reader: Mia the Bridesmaid Fairy",
  "Rainbow Magic Early Reader: Olympia the Games Fairy",
  "Rainbow Magic Early Reader: Selena the Sleepover Fairy",
  "Rainbow Magic Early Reader: Shannon the Ocean Fairy",
  "Rainbow Magic Early Reader: Summer the Holiday Fairy",
  "Rainbow Magic Early Reader: Tamara the Tooth Fairy",
] as const;
const REMOVED_NON_CATALOG_IDS = [190, ...Array.from({ length: 27 }, (_, index) => 214 + index)] as const;

test("Book catalog: all 299 official titles are assigned exactly once", () => {
  const catalogGroups: readonly BookCatalogGroup[] = BOOK_CATALOG_GROUPS;
  assert.equal(OFFICIAL_CATALOG_GROUP_COUNT, 39);
  assert.equal(OFFICIAL_CATALOG_CARD_COUNT, 299);
  assert.equal(OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT, 299);
  assert.equal(BOOK_CATALOG_RECORD_COUNT, 299);
  assert.equal(BOOK_CATALOG_GROUPS.length, 39);
  assert.equal(BOOK_CATALOG_GROUPS[0]?.name, "The Rainbow Fairies");
  assert.equal(BOOK_CATALOG_GROUPS.at(-1)?.name, "Rainbow Magic Graphic Novels");
  assert.ok(BOOK_CATALOG_GROUPS.every((group) => group.sourceKind === "official-current"));

  const specials = BOOK_CATALOG_GROUPS.find((group) => group.id === "specials");
  assert.equal(specials?.books.length, 86);
  assert.ok(specials?.books.some((book) => book.title === "Rainbow Magic: Winter Wishes Collection"));
  const graphicNovels = catalogGroups.find((group) => group.id === "rainbow-magic-graphic-novels");
  assert.deepEqual(graphicNovels?.books.map((book) => book.title), [
    "Rainbow Magic Graphic Novel: Ruby the Red Fairy",
    "Rainbow Magic Graphic Novel: Amber the Orange Fairy",
  ]);

  const catalogTitles = BOOK_CATALOG_GROUPS.flatMap((group) => group.books.map((book) => book.catalogTitle));
  const localTitles = FAIRY_LIST.map((fairy) => fairy.fullTitle);

  assert.equal(catalogTitles.length, 299);
  assert.equal(new Set(catalogTitles).size, 299);
  assert.deepEqual([...catalogTitles].sort(), [...localTitles].sort());
  for (const title of REMOVED_NON_CATALOG_TITLES) assert.ok(!localTitles.includes(title));
  for (const id of REMOVED_NON_CATALOG_IDS) assert.ok(!FAIRY_LIST.some((fairy) => fairy.id === id));
  assert.deepEqual(
    FAIRY_LIST.filter((fairy) => fairy.id >= 327).map((fairy) => fairy.id),
    [327, 328]
  );

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
  assert.match(guidePage, /cardCount: localGroup\?\.books\.length \?\? 0/);
  assert.doesNotMatch(guidePage, /name === "Specials" \? 1 : 0/);
  assert.match(guidePage, /to="\/fairy-names"/);
  assert.match(guidePage, /to="\/books"/);
  assert.match(booksPage, /Printable checklist/);
  assert.match(booksPage, /BookChecklist/);
  assert.match(`${booksRoute}\n${booksPage}`, /fan-made/i);
  assert.match(sitemap, /path: "\/books", priority: "0\.8", lastmod: "2026-08-02"/);
  assert.match(sitemap, /path: "\/rainbow-magic-fairy",[\s\S]*?lastmod: "2026-08-02"/);
});

test("Books page: every current catalog title has one verified Amazon UK affiliate link", () => {
  assert.equal(AMAZON_UK_ASSOCIATE_TAG, "fairybookfind-20");
  assert.equal(AMAZON_UK_PURCHASE_COUNT, 299);

  for (const group of BOOK_CATALOG_GROUPS) {
    for (const book of group.books) {
      const purchase = getAmazonUkPurchase(book.id);
      assert.ok(purchase, `Missing purchase mapping for ${book.title}`);
      assert.equal(purchase.marketplace, "Amazon.co.uk");
      assert.match(purchase.asin, /^[A-Z0-9]{10}$/);
      assert.equal(
        purchase.url,
        `https://www.amazon.co.uk/dp/${purchase.asin}/?tag=fairybookfind-20`
      );
    }
  }

  assert.equal(getAmazonUkPurchase("book-275")?.asin, "1843620162");
  assert.equal(getAmazonUkPurchase("book-258")?.asin, "1408369400");
  assert.equal(getAmazonUkPurchase("book-259")?.asin, "1408369648");
  assert.equal(getAmazonUkPurchase("book-327")?.asin, "1408376326");
  assert.equal(getAmazonUkPurchase("book-328")?.asin, "1408376342");
});

test("Book covers: corrected Specials and Graphic Novels use distinct verified source images", () => {
  const localSource = readFileSync("app/features/fairy-finder/data/fairies.ts", "utf8");
  assert.match(
    localSource,
    /id:\s*258,[\s\S]*?fullTitle:\s*"Rainbow Magic: Nur the Vlogger Fairy"[\s\S]*?9781408369401-195x300\.jpg/
  );
  assert.match(
    localSource,
    /id:\s*259,[\s\S]*?fullTitle:\s*"Rainbow Magic: Winter Wishes Collection"[\s\S]*?9781408369647-1-195x300\.jpg/
  );
  assert.match(
    localSource,
    /id:\s*327,[\s\S]*?fullTitle:\s*"Rainbow Magic Graphic Novel: Ruby the Red Fairy"[\s\S]*?Ruby-the-Red-Fairy-201x300\.jpg/
  );
  assert.match(
    localSource,
    /id:\s*328,[\s\S]*?fullTitle:\s*"Rainbow Magic Graphic Novel: Amber the Orange Fairy"[\s\S]*?9781408376348-201x300\.jpg/
  );
});

test("Homepage and all public book directories use the same official-only title source", async () => {
  const sources = await Promise.all([
    readSource("app/features/fairy-finder/landing-page.tsx"),
    readSource("app/features/fairy-finder/i18n.ts"),
    readSource("app/features/fairy-finder/books-page.tsx"),
    readSource("app/features/fairy-finder/fairy-names-page.tsx"),
    readSource("app/features/fairy-finder/rainbow-magic-fairy-page.tsx"),
    readSource("app/routes/books.tsx"),
    readSource("app/routes/rainbow-magic-fairy.tsx"),
    readSource("app/features/meta/llms.ts"),
  ]);

  for (const source of sources) {
    assert.doesNotMatch(source, /325|297|archive records|archived cover records|Beginner Reader|Early Reader/i);
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
  assert.doesNotMatch(checklist, /Catalog status/);
  assert.doesNotMatch(checklist, /Archive/);
  assert.match(checklist, /Reading status/);
  assert.match(checklist, /Region \/ title/);
  assert.match(checklist, /Where to buy/);
  assert.match(checklist, /aria-expanded=\{isPurchaseOpen\}/);
  assert.match(checklist, /As an Amazon Associate I earn from qualifying purchases\./);
  assert.match(checklist, /rel="nofollow sponsored noopener"/);
  assert.match(checklist, /Paid affiliate link/);
  assert.match(page, /id="amazon-affiliate-disclosure"/);
  assert.match(page, /Amazon Associates disclosure/);
  assert.match(page, /As an Amazon Associate I earn from qualifying purchases\./);
  assert.match(page, /no extra cost to you/i);
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
  assert.match(checklist, /catalog-group-status::after\s*\{\s*content:\s*"Official catalog"/s);
  assert.match(checklist, /catalog-record-status\.is-unread::after\s*\{\s*content:\s*"Official catalog · Unread"/s);
  assert.match(checklist, /catalog-record-status\.is-read::after\s*\{\s*content:\s*"Official catalog · Read"/s);
  assert.match(checklist, /book-purchase-heading::after\s*\{\s*content:\s*"Buying option"/s);
  assert.match(checklist, /book-purchase-marketplace::after\s*\{\s*content:\s*"Amazon\.co\.uk"/s);
  assert.match(checklist, /book-purchase-note::after\s*\{\s*content:\s*"Paid affiliate link · Price and availability may change\."/s);
  assert.match(checklist, /book-purchase-link::before\s*\{\s*content:\s*"Check price"/s);
  assert.match(checklist, /book-purchase-toggle::before\s*\{\s*content:\s*"Where to buy"/s);
  assert.match(checklist, /aria-label=\{`View details for \$\{book\.title\}`\}/);
  assert.match(checklist, /role="status" aria-label=\{isComplete \? "Read" : "To read"\}/);
  assert.match(checklist, /aria-label=\{isComplete \? "Read" : "To read"\}/);
  assert.match(checklist, /role="region" aria-label=\{`Buying option for \$\{bookTitle\}: \$\{purchase\.marketplace\}\. Paid affiliate link\. Price and availability may change\.`\}/);
  assert.match(checklist, /aria-label=\{`Check the price of \$\{bookTitle\} on Amazon\.co\.uk`\}/);
  assert.match(checklist, /aria-label=\{`\$\{isPurchaseOpen \? "Hide" : "Show"\} where to buy \$\{book\.title\}`\}/);
  assert.match(checklist, /aria-hidden className="catalog-group-status/);
  assert.match(checklist, /aria-hidden className=\{clsx\("catalog-record-status/);
  assert.doesNotMatch(checklist, />View details\s*</);
  assert.doesNotMatch(checklist, />\{isComplete \? "Read" : "To read"\}<\/span>/);
  assert.doesNotMatch(checklist, /\/> Buying option<\/p>/);
  assert.doesNotMatch(checklist, />\{purchase\.marketplace\}<\/p>/);
  assert.doesNotMatch(checklist, />Paid affiliate link/);
  assert.doesNotMatch(checklist, />\s*Check price\s*</);
  assert.doesNotMatch(checklist, />Where to buy\s*</);
  assert.doesNotMatch(checklist, /official-archive/);
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
  assert.match(route, /updatedAt: "2026-08-02"/);
});
