import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readSource = (path: string) => readFileSync(path, "utf8");

test("首页性能守卫：首页和结果卡片不加载 Motion 运行时", () => {
  const landingPage = readSource("app/features/fairy-finder/landing-page.tsx");
  const resultCard = readSource(
    "app/features/fairy-finder/components/result-card.tsx"
  );

  assert.doesNotMatch(landingPage, /motion\/react|<motion\.|AnimatePresence/);
  assert.doesNotMatch(resultCard, /motion\/react|<motion\./);
});

test("首页性能守卫：首屏内容不以透明状态等待水合", () => {
  const landingPage = readSource("app/features/fairy-finder/landing-page.tsx");

  assert.doesNotMatch(landingPage, /initial=\{\{[^}]*opacity:\s*0/);
});

test("字体性能守卫：根入口不再引入未使用的 Libre Baskerville", () => {
  const root = readSource("app/root.tsx");

  assert.doesNotMatch(root, /libre-baskerville/i);
});

test("字体性能守卫：Manrope 在慢网下允许跳过字体交换", () => {
  const fonts = readSource("public/fonts/google-fonts.css");

  assert.doesNotMatch(fonts, /font-display:\s*swap/);
  assert.equal((fonts.match(/font-display:\s*optional/g) ?? []).length, 2);
});

test("第三方脚本守卫：统计脚本不再由 head 直接输出", () => {
  const documentSource = readSource("app/features/document/index.tsx");
  const head = documentSource.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";

  assert.doesNotMatch(head, /GoogleAnalytics|MicrosoftClarity/);
});

test("第三方脚本守卫：GA 和 Clarity 使用可取消的非关键调度与去重", () => {
  const googleAnalytics = readSource(
    "app/components/analytics/GoogleAnalytics.tsx"
  );
  const clarity = readSource(
    "app/components/analytics/MicrosoftClarity.tsx"
  );

  for (const source of [googleAnalytics, clarity]) {
    assert.match(source, /scheduleNonCriticalTask/);
    assert.match(source, /document\.getElementById/);
    assert.match(source, /addEventListener\(["']load["']/);
    assert.match(source, /cancelScheduledTask\?\.\(\)/);
  }
});

test("第三方脚本守卫：Document 通过统一调度器延迟广告与 Pageview", () => {
  const documentSource = readSource("app/features/document/index.tsx");

  assert.match(documentSource, /scheduleNonCriticalTask/);
  assert.doesNotMatch(documentSource, /setTimeout\(injectScripts,\s*1500\)/);
});

test("第三方脚本守卫：页底广告临近视口才加载并提供兼容回退", () => {
  const adsterra = readSource(
    "app/features/layout/base-layout/adsterra-native-ad.tsx"
  );

  assert.match(adsterra, /IntersectionObserver/);
  assert.match(adsterra, /rootMargin:\s*["']400px 0px["']/);
  assert.match(adsterra, /scheduleNonCriticalTask/);
});
