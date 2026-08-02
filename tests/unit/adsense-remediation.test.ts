import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { isExplicitlyEnabled } from "../../app/config/third-party-services.js";

const readSource = (path: string) => readFile(path, "utf8");

test("Third-party services: only the exact string true enables a service", () => {
  assert.equal(isExplicitlyEnabled("true"), true);
  for (const value of [undefined, null, "", "TRUE", "1", "false", " true "]) {
    assert.equal(isExplicitlyEnabled(value), false);
  }
});

test("AdSense remediation: public routes do not mount the third-party cover proxy", async () => {
  const routes = await readSource("app/routes.ts");
  assert.doesNotMatch(routes, /route\("fairy-image"/);
});

test("AdSense remediation: locally cached covers render immediately with source attribution", async () => {
  const [coverComponent, marquee, resultCard, listPage, catalog, privacy, about, headers] =
    await Promise.all([
    readSource("app/features/fairy-finder/components/fairy-image.tsx"),
    readSource("app/features/fairy-finder/components/cover-marquee.tsx"),
    readSource("app/features/fairy-finder/components/result-card.tsx"),
    readSource("app/features/fairy-finder/fairy-names-page.tsx"),
    readSource("app/features/fairy-finder/data/fairies.ts"),
    readSource("app/routes/_legal/privacy/content.md"),
    readSource("app/routes/about.tsx"),
    readSource("public/_headers"),
  ]);

  for (const source of [coverComponent, marquee, resultCard, listPage]) {
    assert.doesNotMatch(source, /getFairyImageSrc|\/api\/fairy-image/);
  }

  assert.match(coverComponent, /getFairyCoverAssetPath/);
  assert.match(coverComponent, /src=\{coverAssetPath\}/);
  assert.doesNotMatch(coverComponent, /src=\{imageUrl\}/);
  assert.match(coverComponent, /Orchard Series Books/);
  assert.match(marquee, /CoverSourceNote/);
  assert.match(resultCard, /CoverSourceNote/);
  assert.match(listPage, /CoverSourceNote/);
  assert.equal((catalog.match(/imageUrl:/g) ?? []).length, 299);
  assert.equal((catalog.match(/orchardseriesbooks\.co\.uk/g) ?? []).length, 299);
  assert.match(privacy, /orchardseriesbooks\.co\.uk/);
  assert.match(privacy, /same-origin static assets/);
  assert.match(about, /Orchard Series Books/);
  assert.match(about, /same-origin static assets/);
  assert.match(headers, /\/assets\/fairy-covers\/v1\/\*/);
});

test("AdSense remediation: trust routes are mounted and included in the sitemap", async () => {
  const [routes, sitemap, footerCopy] = await Promise.all([
    readSource("app/routes.ts"),
    readSource("app/routes/_meta/[sitemap.xml].tsx"),
    readSource("app/features/fairy-finder/i18n.ts"),
  ]);

  for (const path of ["about", "contact"]) {
    assert.match(routes, new RegExp(`route\\(\"${path}\"`));
    assert.match(sitemap, new RegExp(`/${path}`));
    assert.match(footerCopy, new RegExp(`/${path}`));
  }
});

test("AdSense remediation: privacy documents name active vendors and required ad disclosures", async () => {
  const [privacy, cookies] = await Promise.all([
    readSource("app/routes/_legal/privacy/content.md"),
    readSource("app/routes/_legal/cookie/content.md"),
  ]);
  const combined = `${privacy}\n${cookies}`;

  for (const disclosure of [
    "Google AdSense",
    "Google Analytics",
    "Microsoft Clarity",
    "Pageview",
    "Adsterra",
    "cookies",
    "web beacons",
    "IP address",
    "Ads Settings",
  ]) {
    assert.match(combined, new RegExp(disclosure, "i"));
  }
});

test("AdSense remediation: advertising and analytics require explicit environment opt-in", async () => {
  const [root, document, adsterra, productionConfig, localConfig] =
    await Promise.all([
    readSource("app/root.tsx"),
    readSource("app/features/document/index.tsx"),
    readSource("app/features/layout/base-layout/adsterra-native-ad.tsx"),
    readSource("wrangler.jsonc"),
    readSource("wrangler.local.jsonc"),
  ]);

  assert.match(root, /ANALYTICS_ENABLED/);
  assert.match(root, /ADVERTISING_ENABLED/);
  assert.match(document, /analyticsEnabled/);
  assert.match(document, /advertisingEnabled/);
  assert.match(adsterra, /advertisingEnabled/);
  for (const config of [productionConfig, localConfig]) {
    assert.match(config, /"ANALYTICS_ENABLED": "false"/);
    assert.match(config, /"ADVERTISING_ENABLED": "false"/);
  }
});
