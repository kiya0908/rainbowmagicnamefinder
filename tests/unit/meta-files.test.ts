import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path: string) => readFile(path, "utf8");

test("root document: does not declare the all-ages site as child-only", async () => {
  const [document, llms] = await Promise.all([
    readSource("app/features/document/index.tsx"),
    readSource("app/features/meta/llms.ts"),
  ]);

  assert.doesNotMatch(document, /<meta name="audience" content="children" \/>/);
  assert.doesNotMatch(llms, /child-directed privacy/i);
  assert.match(llms, /primary adult audience/i);
  assert.match(llms, /protections for younger fans/i);
});

test("robots.txt: public pages and assets stay crawlable while private route families are blocked", async () => {
  const robots = await readSource("app/routes/_meta/[robots.txt]/file.txt");

  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Disallow: \/api$/m);
  assert.match(robots, /^Disallow: \/base$/m);
  assert.doesNotMatch(robots, /^Disallow: \/assets\/$/m);
  assert.doesNotMatch(
    robots,
    /^User-agent: (?:GPTBot|Claude-Web|Anthropic-AI|PerplexityBot|GoogleOther|DuckAssistBot)$/m
  );
  assert.match(robots, /^Sitemap: \{DOMAIN\}\/sitemap\.xml$/m);
});

test("sitemap.xml: canonical public pages use stable last-modified dates", async () => {
  const sitemap = await readSource("app/routes/_meta/[sitemap.xml].tsx");

  for (const path of [
    "/",
    "/rainbow-magic-fairy",
    "/fairy-names",
    "/books",
    "/about",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
    "/legal/acceptable-use",
    "/legal/refund",
  ]) {
    assert.match(sitemap, new RegExp(`path: "${path.replaceAll("/", "\\/")}"`));
  }

  for (const excludedPath of ["/zh", "/base", "/api", "/legal/cookie"]) {
    assert.doesNotMatch(
      sitemap,
      new RegExp(`path: "${excludedPath.replaceAll("/", "\\/")}"`)
    );
  }

  assert.match(sitemap, /<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /lastmod: "2026-08-01"/);
  assert.doesNotMatch(sitemap, /new Date\(\)\.toISOString\(\)/);
  assert.match(sitemap, /application\/xml; charset=utf-8/);
});
