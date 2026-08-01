import type { Route } from "./+types/[sitemap.xml]";

import { getSiteOrigin, toSiteUrl } from "~/config/site";

interface Sitemaps {
  path: string;
  priority: string;
  lastmod?: Date;
}

const defaultSitemaps: Sitemaps[] = [
  { path: "/", priority: "1.0", lastmod: new Date("2026-04-12") },
  {
    path: "/rainbow-magic-fairy",
    priority: "0.9",
    lastmod: new Date("2026-07-28"),
  },
  {
    path: "/fairy-names",
    priority: "0.8",
    lastmod: new Date("2026-05-14"),
  },
  { path: "/books", priority: "0.8", lastmod: new Date("2026-07-28") },
  { path: "/about", priority: "0.7", lastmod: new Date("2026-07-17") },
  { path: "/contact", priority: "0.7", lastmod: new Date("2026-07-17") },
  {
    path: "/legal/privacy",
    priority: "0.6",
    lastmod: new Date("2026-07-17"),
  },
  {
    path: "/legal/terms",
    priority: "0.6",
    lastmod: new Date("2026-07-17"),
  },
  {
    path: "/legal/cookies",
    priority: "0.6",
    lastmod: new Date("2026-07-17"),
  },
  {
    path: "/legal/acceptable-use",
    priority: "0.5",
    lastmod: new Date("2026-07-17"),
  },
  {
    path: "/legal/refund",
    priority: "0.4",
    lastmod: new Date("2026-07-17"),
  },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
  const env =
    context.cloudflare?.env ??
    (typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : {});
  const domain = getSiteOrigin(env.DOMAIN);

  const sitemapList: Array<{
    loc: string;
    lastmod: string;
    priority: string;
  }> = [];

  const sitemaps = defaultSitemaps;
  const seen = new Set<string>();

  sitemaps.forEach((site) => {
    const loc = toSiteUrl(site.path, domain);

    if (seen.has(loc)) return;
    seen.add(loc);

    sitemapList.push({
      loc,
      lastmod: site.lastmod
        ? site.lastmod.toISOString()
        : new Date().toISOString(),
      priority: site.priority,
    });
  });

  const content = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${sitemapList
          .map((site) => {
            return `
            <url>
              <loc>${site.loc}</loc>
              <lastmod>${site.lastmod}</lastmod>
              <priority>${site.priority}</priority>
            </url>
          `;
          })
          .join("\n")}
      </urlset>
      `;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      encoding: "UTF-8",
    },
  });
};
