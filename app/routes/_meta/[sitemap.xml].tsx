import type { Route } from "./+types/[sitemap.xml]";

import { getContentSitemapEntries } from "~/features/content/registry";

interface Sitemaps {
  path: string;
  priority: string;
  lastmod?: Date;
}
const defaultSitemaps: Sitemaps[] = [
  {
    path: "/",
    priority: "1.0",
    lastmod: new Date("2026-04-09"),
  },
  {
    path: "/zh",
    priority: "0.9",
    lastmod: new Date("2026-03-30"),
  },
  {
    path: "/legal/privacy",
    priority: "0.6",
    lastmod: new Date("2026-03-24"),
  },
  {
    path: "/legal/terms",
    priority: "0.6",
    lastmod: new Date("2026-03-24"),
  },
  {
    path: "/legal/cookie",
    priority: "0.6",
    lastmod: new Date("2026-03-24"),
  },
];

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const url = new URL(request.url);

  const sitemapList: Array<{
    loc: string;
    lastmod: string;
    priority: string;
  }> = [];

  const sitemaps = [...defaultSitemaps, ...getContentSitemapEntries()];
  const seen = new Set<string>();

  sitemaps.forEach((site) => {
    const location = new URL(site.path, url);

    const loc = location.toString();

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
