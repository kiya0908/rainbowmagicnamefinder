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

test("Audience signals: homepage and About page identify the adult-oriented resource context", async () => {
  const [homepage, about] = await Promise.all([
    readSource("app/features/fairy-finder/landing-page.tsx"),
    readSource("app/routes/about.tsx"),
  ]);

  assert.match(
    homepage,
    /A parent's tool for finding magical fairy names inspired by the Rainbow Magic book series/
  );
  assert.match(
    about,
    /Built by a parent and Rainbow Magic collector for fellow fans and families/
  );
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

test("Cookie policy: disclosures match first-party session and local-storage behavior", async () => {
  const [cookies, session, checklist] = await Promise.all([
    readSource("app/routes/_legal/cookie/content.md"),
    readSource("app/.server/libs/session.ts"),
    readSource("app/features/fairy-finder/components/book-checklist.tsx"),
  ]);

  assert.match(session, /createCookie\("__session"/);
  assert.match(session, /maxAge: 60 \* 60 \* 24 \* 30/);
  assert.match(cookies, /`__session`/);
  assert.match(cookies, /up to 30 days/i);

  assert.match(
    checklist,
    /CHECKLIST_STORAGE_KEY = "rainbow-magic-book-catalog-checklist-v2"/
  );
  assert.match(cookies, /`rainbow-magic-book-catalog-checklist-v2`/);
  assert.match(cookies, /local storage/i);

  for (const heading of [
    "Cookies and Similar Technologies Used on This Website",
    "Strictly Necessary Technologies",
    "Advertising Technologies",
    "Analytics Technologies",
    "Children's Privacy",
    "How to Manage Cookies",
  ]) {
    assert.match(cookies, new RegExp(heading));
  }

  for (const browser of ["Google Chrome", "Mozilla Firefox", "Apple Safari"]) {
    assert.match(cookies, new RegExp(browser));
  }

  assert.doesNotMatch(cookies, /cookie consent cookie/i);
  assert.doesNotMatch(cookies, /fairy name results[^\n]*session cookie/i);
});

test("Privacy documents: describe the primary adult audience without excluding younger fans", async () => {
  const [privacy, cookies] = await Promise.all([
    readSource("app/routes/_legal/privacy/content.md"),
    readSource("app/routes/_legal/cookie/content.md"),
  ]);

  for (const policy of [privacy, cookies]) {
    assert.match(policy, /intended primarily for parents, educators, collectors/i);
    assert.match(policy, /fans of all ages, including children under 13/i);
    assert.doesNotMatch(policy, /this website is directed to children under the age of 13/i);
    assert.doesNotMatch(policy, /do not request, collect, or store[\s\S]*any other personal data from users of any age/i);
  }
});

test("AdSense remediation: every page requests non-personalized ads before loading AdSense", async () => {
  const document = await readSource("app/features/document/index.tsx");
  const privacySignalIndex = document.indexOf("requestNonPersonalizedAds = 1");
  const scriptInjectionIndex = document.indexOf("document.head.appendChild(adsScript)");

  assert.notEqual(privacySignalIndex, -1);
  assert.notEqual(scriptInjectionIndex, -1);
  assert.ok(privacySignalIndex < scriptInjectionIndex);
});

test("AdSense remediation: production services are explicit and local services stay off", async () => {
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
  assert.match(productionConfig, /"ANALYTICS_ENABLED": "true"/);
  assert.match(productionConfig, /"ADVERTISING_ENABLED": "true"/);
  assert.match(localConfig, /"ANALYTICS_ENABLED": "false"/);
  assert.match(localConfig, /"ADVERTISING_ENABLED": "false"/);
});
