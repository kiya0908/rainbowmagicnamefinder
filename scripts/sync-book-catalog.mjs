import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SOURCE_URL = "https://orchardseriesbooks.co.uk/rainbow-magic/books/";
const SOURCE_CHECKED_AT = "2026-08-02";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fairiesPath = path.join(root, "app/features/fairy-finder/data/fairies.ts");
const outputPath = path.join(root, "app/features/fairy-finder/data/book-catalog.ts");

const decodeHtml = (value) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const textOnly = (value) => decodeHtml(value.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

const normalizeTitle = (value) =>
  textOnly(value)
    .replace(/^Rainbow Magic:\s*/i, "")
    .replace(/\s*\(2006\s+world book day\s+special\).*$/i, "")
    .replace(/[‘’]/g, "'")
    .toLocaleLowerCase("en-GB");

const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const response = await fetch(SOURCE_URL, { headers: { "user-agent": "rainbowmagicnamefinder catalog verifier" } });
if (!response.ok) throw new Error(`Official catalog request failed: ${response.status} ${response.statusText}`);
const html = await response.text();

const localSource = await readFile(fairiesPath, "utf8");
const localBooks = [...localSource.matchAll(/\{\s*id:\s*(\d+),[\s\S]*?fullTitle:\s*"([^"]+)"[\s\S]*?\}/g)].map((match) => ({
  id: Number.parseInt(match[1], 10),
  title: match[2],
}));
if (localBooks.length !== 299) throw new Error(`Expected 299 local records, found ${localBooks.length}`);

const localByNormalizedTitle = new Map(localBooks.map((book) => [normalizeTitle(book.title), book]));
if (localByNormalizedTitle.size !== localBooks.length) throw new Error("Local catalog contains duplicate normalized titles");

const menuStart = html.indexOf('<div id="subseriesmenu"');
const menuEnd = html.indexOf("</div>", menuStart);
if (menuStart < 0 || menuEnd < 0) throw new Error("Official catalog group menu was not found");
const menu = html.slice(menuStart, menuEnd);
const sourceGroups = [...menu.matchAll(/<a[^>]+href="#([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => ({
  markerId: decodeHtml(match[1]),
  name: textOnly(match[2]),
}));
if (sourceGroups.length !== 39) throw new Error(`Expected 39 official catalog groups, found ${sourceGroups.length}`);

const parsedGroups = sourceGroups.map((group, index) => {
  const marker = `<div id="${group.markerId}"`;
  const start = html.indexOf(marker, menuEnd);
  const nextMarker = sourceGroups[index + 1] ? `<div id="${sourceGroups[index + 1].markerId}"` : "</section>";
  const end = html.indexOf(nextMarker, start + marker.length);
  if (start < 0 || end < 0) throw new Error(`Could not isolate official group: ${group.name}`);
  const segment = html.slice(start, end);
  const titles = [...segment.matchAll(/<div class="tooltip">\s*<h3>([\s\S]*?)<\/h3>/g)].map((match) => textOnly(match[1]));

  // The official Specials markup currently labels the Winter Wishes card as a
  // second Nur title even though its image alt text and retailer links identify
  // Winter Wishes. Keep this narrow correction loud so a future source fix
  // fails review instead of silently duplicating Nur again.
  if (group.name === "Specials") {
    const nurIndexes = titles
      .map((title, titleIndex) => title === "Rainbow Magic: Nur the Vlogger Fairy" ? titleIndex : -1)
      .filter((titleIndex) => titleIndex >= 0);
    if (!segment.includes("Rainbow Magic: Winter Wishes Collection") || nurIndexes.length !== 2) {
      throw new Error("Expected the known Winter Wishes / Nur source-title mismatch");
    }
    titles[nurIndexes[0]] = "Rainbow Magic: Winter Wishes Collection";
  }
  return { name: group.name, titles };
});

const officialCardCount = parsedGroups.reduce((count, group) => count + group.titles.length, 0);
const officialUniqueTitles = new Set(parsedGroups.flatMap((group) => group.titles.map(normalizeTitle)));
if (officialCardCount !== 299 || officialUniqueTitles.size !== 299) {
  throw new Error(`Official catalog changed: ${officialCardCount} cards / ${officialUniqueTitles.size} unique titles`);
}

const assigned = new Set();
const catalogGroups = parsedGroups
  .map((group) => {
    const books = [];
    for (const title of group.titles) {
      const key = normalizeTitle(title);
      if (assigned.has(key)) continue;
      const local = localByNormalizedTitle.get(key);
      if (!local) throw new Error(`Official title is missing locally: ${title}`);
      assigned.add(key);
      books.push(local);
    }
    return { id: slugify(group.name), name: group.name, sourceKind: "official-current", books };
  })
  .filter((group) => group.books.length > 0);

if (assigned.size !== localBooks.length) {
  const missing = localBooks.filter((book) => !assigned.has(normalizeTitle(book.title))).map((book) => book.title);
  throw new Error(`Unassigned local titles: ${missing.join(", ")}`);
}
if (catalogGroups.length !== 39) throw new Error(`Expected 39 checklist groups, found ${catalogGroups.length}`);

const q = (value) => JSON.stringify(value);
const groupSource = catalogGroups
  .map((group) => `  {\n    id: ${q(group.id)},\n    name: ${q(group.name)},\n    sourceKind: ${q(group.sourceKind)},\n    books: [\n${group.books.map((book) => `      book(${book.id}, ${q(book.title)}),`).join("\n")}\n    ],\n  },`)
  .join("\n");

const generated = `// Generated by scripts/sync-book-catalog.mjs from the official Orchard catalog and FAIRY_LIST.\n// Do not hand-edit title membership; rerun pnpm sync:book-catalog after reviewing source changes.\n\nexport type BookCatalogSourceKind = "official-current" | "official-archive";\n\nexport interface BookCatalogBook {\n  id: string;\n  title: string;\n  catalogTitle: string;\n}\n\nexport interface BookCatalogGroup {\n  id: string;\n  name: string;\n  sourceKind: BookCatalogSourceKind;\n  books: readonly BookCatalogBook[];\n}\n\nconst book = (id: number, title: string): BookCatalogBook => ({\n  id: \`book-\${id}\`,\n  title,\n  catalogTitle: title,\n});\n\nexport const OFFICIAL_CATALOG_SOURCE_URL = ${q(SOURCE_URL)};\nexport const OFFICIAL_CATALOG_CHECKED_AT = ${q(SOURCE_CHECKED_AT)};\nexport const OFFICIAL_CATALOG_GROUP_COUNT = ${sourceGroups.length};\nexport const OFFICIAL_CATALOG_CARD_COUNT = ${officialCardCount};\nexport const OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT = ${officialUniqueTitles.size};\nexport const OFFICIAL_CATALOG_GROUP_NAMES = ${JSON.stringify(sourceGroups.map((group) => group.name), null, 2)} as const;\n\nexport const BOOK_CATALOG_GROUPS = [\n${groupSource}\n] as const satisfies readonly BookCatalogGroup[];\n\nexport const BOOK_CATALOG_RECORD_COUNT = BOOK_CATALOG_GROUPS.reduce(\n  (count, group) => count + group.books.length,\n  0\n);\n`;

const officialOnlyGenerated = generated.replace(
  'export type BookCatalogSourceKind = "official-current" | "official-archive";',
  'export type BookCatalogSourceKind = "official-current";'
);
if (officialOnlyGenerated === generated) throw new Error("Could not narrow the generated catalog source type");

await writeFile(outputPath, officialOnlyGenerated, "utf8");
console.log(`Generated ${catalogGroups.length} checklist groups / ${localBooks.length} records from ${sourceGroups.length} official groups.`);
