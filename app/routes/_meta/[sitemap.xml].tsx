import type { Route } from "./+types/[sitemap.xml]";

import { getSiteOrigin, toSiteUrl } from "~/config/site";

interface SitemapEntry {
  path: string;
  priority: string;
  lastmod: string;
}

const sitemapEntries: SitemapEntry[] = [
  { path: "/", priority: "1.0", lastmod: "2026-05-31" },
  {
    path: "/rainbow-magic-fairy",
    priority: "0.9",
    lastmod: "2026-08-02",
  },
  { path: "/fairy-names", priority: "0.8", lastmod: "2026-08-01" },
  { path: "/books", priority: "0.8", lastmod: "2026-08-02" },
  { path: "/about", priority: "0.7", lastmod: "2026-08-01" },
  { path: "/contact", priority: "0.7", lastmod: "2026-08-01" },
  { path: "/legal/privacy", priority: "0.6", lastmod: "2026-08-01" },
  { path: "/legal/terms", priority: "0.6", lastmod: "2026-08-01" },
  { path: "/legal/cookies", priority: "0.6", lastmod: "2026-08-01" },
  {
    path: "/legal/acceptable-use",
    priority: "0.5",
    lastmod: "2026-08-01",
  },
  { path: "/legal/refund", priority: "0.4", lastmod: "2026-08-01" },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
  const env =
    context.cloudflare?.env ??
    (typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {});
  const domain = getSiteOrigin(env.DOMAIN);
  const seen = new Set<string>();

  const urls = sitemapEntries.flatMap((entry) => {
    const loc = toSiteUrl(entry.path, domain);

    if (seen.has(loc)) return [];
    seen.add(loc);

    return [
      `  <url>\n` +
        `    <loc>${loc}</loc>\n` +
        `    <lastmod>${entry.lastmod}</lastmod>\n` +
        `    <priority>${entry.priority}</priority>\n` +
        `  </url>`,
    ];
  });

  const content =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls.join("\n")}\n` +
    `</urlset>\n`;

  return new Response(content, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
