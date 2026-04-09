//渲染 tools / templates / blog 的目录列表页。
import { ArrowRight } from "lucide-react";

import { Link } from "~/components/common";

import { ContentSiteLayout } from "./site-layout";
import type { CollectionPageContent, ContentEntrySummary } from "./types";
import { formatContentDate } from "./utils";

interface ContentCollectionPageProps {
  page: CollectionPageContent;
  entries: ContentEntrySummary[];
  alternatePath?: string | null;
}

export const ContentCollectionPage = ({
  page,
  entries,
  alternatePath,
}: ContentCollectionPageProps) => {
  return (
    <ContentSiteLayout
      locale={page.locale}
      activeCollection={page.collection}
      alternatePath={alternatePath}
    >
      <section className="px-6 py-18 md:py-24 bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] font-bold text-primary mb-4">
            {page.eyebrow}
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface max-w-4xl leading-tight">
            {page.heading}
          </h1>
          <p className="text-lg text-on-surface-variant max-w-3xl mt-6 leading-relaxed">
            {page.intro}
          </p>
        </div>
      </section>

      <section className="px-6 py-14 md:py-18">
        <div className="max-w-7xl mx-auto">
          {entries.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {entries.map((entry) => {
                const updatedLabel = formatContentDate(
                  entry.updatedAt ?? entry.publishedAt,
                  page.locale
                );

                return (
                  <article
                    key={`${entry.locale}-${entry.collection}-${entry.slug}`}
                    className="rounded-3xl border border-outline-variant bg-white p-7 flex flex-col shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-on-surface-variant/70">
                      <span>{page.collection}</span>
                      {updatedLabel ? <span>{updatedLabel}</span> : null}
                    </div>

                    <h2 className="mt-5 text-2xl font-bold leading-tight text-on-surface">
                      <Link to={entry.path} className="hover:text-primary">
                        {entry.title}
                      </Link>
                    </h2>

                    <p className="mt-4 text-on-surface-variant leading-relaxed flex-1">
                      {entry.excerpt}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {entry.keywords.slice(0, 3).map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={entry.path}
                      className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      {page.locale === "zh" ? "查看详情" : "View page"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-outline-variant bg-white p-10 text-on-surface-variant">
              {page.emptyState}
            </div>
          )}
        </div>
      </section>
    </ContentSiteLayout>
  );
};
