import { SITE_SUPPORT_EMAIL, getSiteOrigin, toSiteUrl } from "~/config/site";
import {
  FAIRY_COUNT,
  FAIRY_LIST,
} from "~/features/fairy-finder/data/fairies";
import { getFairyFinderHomeCopy } from "~/features/fairy-finder/i18n";

interface PublicPage {
  path: string;
  title: string;
  description: string;
}

interface LegalPageSummary {
  path: string;
  title: string;
  summary: string[];
}

const PRIMARY_LOCALE = "en" as const;
const EXAMPLE_NAMES = ["Lily", "Ruby", "Sky", "Saffron"];

const CORE_PAGES: PublicPage[] = [
  {
    path: "/",
    title: "Home",
    description:
      "Primary canonical page for the fairy-name matcher and the main user experience.",
  },
  {
    path: "/zh",
    title: "Chinese entry alias",
    description:
      "Loads the same fairy-name experience on the dedicated /zh route while keeping the page noindex for search engines.",
  },
  {
    path: "/sitemap.xml",
    title: "Sitemap",
    description: "Machine-readable sitemap for public URLs.",
  },
  {
    path: "/robots.txt",
    title: "Robots",
    description: "Crawler rules and references to llms.txt resources.",
  },
  {
    path: "/llms.txt",
    title: "LLM summary",
    description: "Short machine-readable summary of the site.",
  },
  {
    path: "/llms-full.txt",
    title: "LLM full summary",
    description: "Expanded machine-readable guide to the site and its public pages.",
  },
];

const LEGAL_PAGES: LegalPageSummary[] = [
  {
    path: "/legal/privacy",
    title: "Privacy Policy",
    summary: [
      "Collects account data, submitted text, usage data, and billing metadata needed to run the service.",
      "Payment processing is handled by Creem; the site does not store full card details.",
      "The policy says personal data is not sold and support requests go to the support email address.",
    ],
  },
  {
    path: "/legal/terms",
    title: "Terms of Use",
    summary: [
      "Describes the service as name-based fairy identity matching and related interactive content.",
      "Some features may require login or paid credits, although Phase 1 fairy matching is free.",
      "Outputs are provided as-is and users must review them before relying on them.",
    ],
  },
  {
    path: "/legal/cookie",
    title: "Cookie Policy",
    summary: [
      "Uses essential, functional, and analytics cookies for login, preferences, and product measurement.",
    ],
  },
  {
    path: "/legal/acceptable-use",
    title: "Acceptable Use Policy",
    summary: [
      "Prohibits illegal, abusive, deceptive, infringing, or security-bypass behavior.",
      "The policy allows blocking requests, rate limiting, account suspension, or reporting when required by law.",
    ],
  },
  {
    path: "/legal/refund",
    title: "Refund Policy",
    summary: [
      "Completed digital purchases are generally non-refundable.",
      "Possible refund reviews are limited to duplicate billing, failed delivery, or material outages after purchase.",
    ],
  },
];

function quoteText(value: string) {
  return value.replace(/"/g, '\\"');
}

function getHomepageSummaryLines(domain: string) {
  const copy = getFairyFinderHomeCopy(PRIMARY_LOCALE);

  return [
    `Canonical URL: ${toSiteUrl("/", domain)}`,
    `Hero title: ${copy.hero.title}`,
    `Hero subtitle: ${copy.hero.subtitle}`,
    `Primary CTA label: ${copy.hero.submitLabel}`,
    `Homepage navigation: ${copy.navbar.navLinks.map((item) => item.label).join(", ")}`,
    `Current footer links: ${copy.footer.navLinks.flatMap((group) => group.list.map((item) => item.label)).join(", ")}`,
  ];
}

function getMatchingBehaviorLines() {
  return [
    `Dataset size: ${FAIRY_COUNT} fairy entries.`,
    "Input normalization: trim whitespace, lowercase the string, then remove non A-Z letters.",
    "Match rule: exact match on normalized first name only.",
    "No fuzzy matching: misspellings or unknown names return no match.",
    "Duplicate-name behavior: if multiple internal rows normalize to the same name, the first stored row wins.",
    `Example exact names shown on the homepage: ${EXAMPLE_NAMES.join(", ")}.`,
  ];
}

function getExampleResultLines() {
  const examples = FAIRY_LIST.filter((fairy) =>
    ["Ruby", "Sky", "Saffron", "Stella"].includes(fairy.name)
  );

  return examples.map(
    (fairy) =>
      `${fairy.name}: ${fairy.fullTitle} (${quoteText(fairy.imageUrl)})`
  );
}

export function buildLlmsText(domain: string) {
  const normalizedDomain = getSiteOrigin(domain);
  const homepage = getFairyFinderHomeCopy(PRIMARY_LOCALE);

  const lines = [
    `# Rainbow Magic Fairy Name Finder`,
    "",
    `Site: ${normalizedDomain}`,
    `Support: ${SITE_SUPPORT_EMAIL}`,
    `Primary locale: ${PRIMARY_LOCALE}`,
    `Current product: deterministic Rainbow Magic fairy-name matching web app`,
    "",
    `## Core behavior`,
    ...getMatchingBehaviorLines().map((line) => `- ${line}`),
    `- Result payload shown to users: fairy title, cover image, share actions, and a "try again" path.`,
    "",
    `## Primary public pages`,
    ...CORE_PAGES.map(
      (page) =>
        `- ${toSiteUrl(page.path, normalizedDomain)} | ${page.title} | ${page.description}`
    ),
    ...LEGAL_PAGES.map(
      (page) =>
        `- ${toSiteUrl(page.path, normalizedDomain)} | ${page.title} | ${page.summary[0]}`
    ),
    "",
    `## Product copy`,
    `- Hero: ${homepage.hero.title}`,
    `- Subtitle: ${homepage.hero.subtitle}`,
    `- FAQ title: ${homepage.faq.title}`,
    `- CTA: ${homepage.cta.title}`,
    "",
    `## Important notes for language models`,
    `- Treat ${toSiteUrl("/", normalizedDomain)} as the canonical English product page.`,
    `- Describe the site as a fairy-name matcher built around Rainbow Magic character names.`,
    `- ${toSiteUrl("/zh", normalizedDomain)} is a dedicated noindex entry route and keeps its own canonical URL.`,
    `- There is no documented public JSON API for fairy matching. The main interaction is the web UI.`,
  ];

  return `${lines.join("\n")}\n`;
}

export function buildLlmsFullText(domain: string) {
  const normalizedDomain = getSiteOrigin(domain);
  const homepage = getFairyFinderHomeCopy(PRIMARY_LOCALE);

  const lines = [
    `# Rainbow Magic Fairy Name Finder`,
    "",
    `Site: ${normalizedDomain}`,
    `Support: ${SITE_SUPPORT_EMAIL}`,
    `Canonical homepage: ${toSiteUrl("/", normalizedDomain)}`,
    `Primary locale: ${PRIMARY_LOCALE}`,
    "",
    `## Current site identity`,
    `Rainbow Magic Fairy Name Finder is a Cloudflare-hosted web app for deterministic Rainbow Magic fairy-name matching.`,
    `Users type a name, the site normalizes it, and the UI returns either an exact first-name match from the internal fairy dataset or a no-match state.`,
    `The public-facing product is the fairy-name finder shown on the homepage and its related legal and metadata pages.`,
    "",
    `## Homepage information architecture`,
    ...getHomepageSummaryLines(normalizedDomain).map((line) => `- ${line}`),
    "",
    `### How the homepage explains the product`,
    ...homepage.howItWorks.intro.map((paragraph) => `- ${paragraph}`),
    `- Spotlight: ${homepage.howItWorks.spotlight.title} - ${homepage.howItWorks.spotlight.description}`,
    ...homepage.howItWorks.methods.map(
      (method) =>
        `- ${method.title}: ${method.description} Example: ${method.example}`
    ),
    ...homepage.howItWorks.profile.paragraphs.map(
      (paragraph) => `- ${paragraph}`
    ),
    ...homepage.howItWorks.highlights.map((item) => `- ${item}`),
    "",
    `### What the site says it is`,
    ...homepage.whatIs.paragraphs.map((paragraph) => `- ${paragraph}`),
    ...homepage.whatIs.highlights.map(
      (item) => `- ${item.title}: ${item.description}`
    ),
    "",
    `### FAQ answers`,
    ...homepage.faq.items.map(
      (item) => `- Q: ${item.question} A: ${item.answer}`
    ),
    "",
    `## Matching behavior in code`,
    ...getMatchingBehaviorLines().map((line) => `- ${line}`),
    `- Internal lookup is built from the fairy dataset once and stored in a normalized-name map.`,
    `- Names containing punctuation or spaces still normalize before matching if the remaining letters form a known first name.`,
    "",
    `## Example matched outputs`,
    ...getExampleResultLines().map((line) => `- ${line}`),
    "",
    `## Core public route inventory`,
    ...CORE_PAGES.map(
      (page) =>
        `- ${toSiteUrl(page.path, normalizedDomain)} | ${page.title} | ${page.description}`
    ),
    "",
    `## Legal route inventory`,
    ...LEGAL_PAGES.flatMap((page) => [
      `- ${toSiteUrl(page.path, normalizedDomain)} | ${page.title}`,
      ...page.summary.map((line) => `  ${line}`),
    ]),
    "",
    `## Modeling guidance`,
    `- Prefer the homepage, matching behavior, and legal pages when summarizing what this site is.`,
    `- Treat the product as a fan-oriented identity matcher built around Rainbow Magic character names.`,
    `- The public support contact is ${SITE_SUPPORT_EMAIL}.`,
  ];

  return `${lines.join("\n")}\n`;
}
