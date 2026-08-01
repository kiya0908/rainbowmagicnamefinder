import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path: string) => readFile(path, "utf8");

test("Open Design：四个路由保持精简，页面实现归属功能目录", async () => {
  const routePaths = [
    "app/routes/home.tsx",
    "app/routes/fairy-names.tsx",
    "app/routes/books.tsx",
    "app/routes/rainbow-magic-fairy.tsx",
  ];
  const pagePaths = [
    "app/features/fairy-finder/landing-page.tsx",
    "app/features/fairy-finder/fairy-names-page.tsx",
    "app/features/fairy-finder/books-page.tsx",
    "app/features/fairy-finder/rainbow-magic-fairy-page.tsx",
  ];

  const [routes, pages] = await Promise.all([
    Promise.all(routePaths.map(readSource)),
    Promise.all(pagePaths.map(readSource)),
  ]);

  for (const route of routes) {
    assert.ok(route.length < 6_000, "路由文件只应保留 meta 与页面组合");
    assert.doesNotMatch(route, /useState|useEffect|<section/);
  }

  for (const page of pages) {
    assert.match(page, /FairySiteLayout/);
  }
});

test("Open Design：页面继续由现有 Fairy 与 Book Catalog 数据驱动", async () => {
  const [namesPage, booksPage, guidePage, checklist] = await Promise.all([
    readSource("app/features/fairy-finder/fairy-names-page.tsx"),
    readSource("app/features/fairy-finder/books-page.tsx"),
    readSource("app/features/fairy-finder/rainbow-magic-fairy-page.tsx"),
    readSource("app/features/fairy-finder/components/book-checklist.tsx"),
  ]);

  assert.match(namesPage, /FAIRY_LIST/);
  assert.match(booksPage, /BOOK_CATALOG_GROUPS/);
  assert.match(guidePage, /OFFICIAL_GROUPS/);
  assert.match(guidePage, /to="\/fairy-names"/);
  assert.match(guidePage, /to="\/books"/);
  assert.match(checklist, /rainbow-magic-book-catalog-checklist-v2/);
});

test("Open Design：首页动画保持轻量并尊重减少动态效果偏好", async () => {
  const [landingPage, styles] = await Promise.all([
    readSource("app/features/fairy-finder/landing-page.tsx"),
    readSource("app/app.css"),
  ]);

  assert.doesNotMatch(landingPage, /motion\/react|framer-motion|<motion\./);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /fairy-cover-track/);
});

test("Open Design：首页 Fairy Names 入口与推荐名称保持居中", async () => {
  const landingPage = await readSource(
    "app/features/fairy-finder/landing-page.tsx"
  );

  assert.match(
    landingPage,
    /className="mx-auto mt-5 flex min-h-11 w-fit[^\"]*"/
  );
  assert.match(landingPage, /Browse All \{FAIRY_LIST\.length\} Fairy Names/);
});

test("Open Design：Fairy Guide Hero 操作按钮使用明确的主次对比", async () => {
  const guidePage = await readSource(
    "app/features/fairy-finder/rainbow-magic-fairy-page.tsx"
  );

  assert.match(guidePage, /bg-primary-container[^\"]*text-on-primary/);
  assert.match(
    guidePage,
    /border border-outline-variant bg-white[^\"]*text-on-surface/
  );
  assert.doesNotMatch(guidePage, /className="btn btn-(?:primary|outline)/);
});

test("Open Design：四个主要页面共享同一套 Hero、字体和背景 Token", async () => {
  const [home, names, books, guide, hero, styles] = await Promise.all([
    readSource("app/features/fairy-finder/landing-page.tsx"),
    readSource("app/features/fairy-finder/fairy-names-page.tsx"),
    readSource("app/features/fairy-finder/books-page.tsx"),
    readSource("app/features/fairy-finder/rainbow-magic-fairy-page.tsx"),
    readSource("app/features/fairy-finder/components/fairy-page-hero.tsx"),
    readSource("app/app.css"),
  ]);

  for (const page of [home, names, books, guide]) {
    assert.match(page, /FairyPageHero/);
  }

  for (const page of [names, books, guide]) {
    assert.match(page, /FairyCoverFeature/);
    assert.match(page, /FairyBreadcrumb/);
  }

  assert.match(hero, /eyebrow:\s*string/);
  assert.doesNotMatch(hero, /items-center gap-2 font-mono/);
  assert.match(styles, /\.fairy-site-layout\s*\{/);
  assert.match(styles, /--color-surface:\s*#fffdf9/);
  assert.match(styles, /\.fairy-site-layout h1/);
  assert.match(styles, /font-family:\s*ui-serif/);
});

test("Open Design：弹窗保留键盘关闭、焦点恢复与滚动锁定", async () => {
  const [namesPage, checklist] = await Promise.all([
    readSource("app/features/fairy-finder/fairy-names-page.tsx"),
    readSource("app/features/fairy-finder/components/book-checklist.tsx"),
  ]);

  for (const source of [namesPage, checklist]) {
    assert.match(source, /event\.key === "Escape"/);
    assert.match(source, /document\.body\.style\.overflow = "hidden"/);
  }

  assert.match(checklist, /event\.key !== "Tab"/);
  assert.match(checklist, /resetButtonRef\.current\?\.focus/);
});

test("Open Design：移动端字母索引使用可展开面板并保留现有锚点", async () => {
  const namesPage = await readSource(
    "app/features/fairy-finder/fairy-names-page.tsx"
  );

  assert.match(namesPage, /ALPHABET\.slice\(0, 7\)/);
  assert.match(namesPage, /aria-controls="fairy-letter-panel"/);
  assert.match(namesPage, /aria-expanded=\{isLetterPanelOpen\}/);
  assert.match(namesPage, /setIsLetterPanelOpen\(false\)/);
  assert.match(namesPage, /href=\{`#letter-\$\{letter\}`\}/);
  assert.match(namesPage, /id=\{`letter-\$\{letter\}`\}/);
  assert.doesNotMatch(namesPage, /overflow-x-auto overscroll-x-contain/);
});
