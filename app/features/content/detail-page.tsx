//渲染内容详情页，包括正文、关键词、相关页面。
import type { RenderableTreeNodes } from "@markdoc/markdoc";
import { ArrowRight, Globe2 } from "lucide-react";

import { Link } from "~/components/common";
import { MarkdownArticle } from "~/components/markdown";

import { ContentSiteLayout } from "./site-layout";
import type {
  ContentCollection,
  ContentEntrySummary,
  ContentLocale,
} from "./types";
import {
  formatContentDate,
  getCollectionLabel,
  getCollectionPath,
  getHomePath,
  getLocalizedHomeLabel,
} from "./utils";

interface ContentDetailPageProps {
  locale: ContentLocale;
  collection: ContentCollection;
  entry: ContentEntrySummary;
  node: RenderableTreeNodes;
  relatedEntries: ContentEntrySummary[];
  alternatePath?: string | null;
}

export const ContentDetailPage = ({
  locale,
  collection,
  entry,
  node,
  relatedEntries,
  alternatePath,
}: ContentDetailPageProps) => {
  const updatedLabel = formatContentDate(
    entry.updatedAt ?? entry.publishedAt,
    locale
  );

  return (
    <ContentSiteLayout
      locale={locale}
      activeCollection={collection}
      alternatePath={alternatePath}
    >
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid gap-12 xl:grid-cols-[minmax(0,1fr),19rem]">
          <article className="min-w-0">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
              <Link to={getHomePath(locale)} className="hover:text-primary">
                {getLocalizedHomeLabel(locale)}
              </Link>
              <span>/</span>
              <Link
                to={getCollectionPath(locale, collection)}
                className="hover:text-primary"
              >
                {getCollectionLabel(collection, locale)}
              </Link>
            </nav>

            <div className="mt-6 rounded-[2rem] bg-surface-container-low border border-outline-variant p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary mb-4">
                {getCollectionLabel(collection, locale)}
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-on-surface">
                {entry.title}
              </h1>
              <p className="mt-5 text-lg text-on-surface-variant max-w-3xl leading-relaxed">
                {entry.description}
              </p>
              {updatedLabel ? (
                <p className="mt-6 text-sm text-on-surface-variant/80">
                  {locale === "zh" ? "最近更新" : "Last updated"}: {updatedLabel}
                </p>
              ) : null}
            </div>

            <MarkdownArticle
              node={node}
              className="markdown-body bg-white border border-outline-variant rounded-[2rem] p-6 md:p-10 mt-8"
            />
          </article>

          <aside className="space-y-6">
            {alternatePath ? (
              <div className="rounded-[2rem] border border-outline-variant bg-white p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <Globe2 className="w-4 h-4 text-primary" />
                  {locale === "zh" ? "语言版本" : "Language version"}
                </div>
                <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                  {locale === "zh"
                    ? "如果你需要英文镜像页，可以直接切换到对应版本。"
                    : "If you need the Chinese mirror page, you can switch directly here."}
                </p>
                <Link
                  to={alternatePath}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  {locale === "zh" ? "查看英文版本" : "View Chinese version"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : null}

            <div className="rounded-[2rem] border border-outline-variant bg-white p-6">
              <h2 className="text-base font-bold text-on-surface">
                {locale === "zh" ? "关键词" : "Keywords"}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-outline-variant bg-white p-6">
              <h2 className="text-base font-bold text-on-surface">
                {locale === "zh" ? "相关页面" : "Related pages"}
              </h2>
              <div className="mt-4 space-y-4">
                {relatedEntries.length ? (
                  relatedEntries.map((item) => (
                    <div
                      key={item.path}
                      className="border-b border-outline-variant/70 pb-4 last:border-b-0 last:pb-0"
                    >
                      <Link
                        to={item.path}
                        className="font-semibold text-on-surface hover:text-primary leading-snug"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {locale === "zh"
                      ? "更多相关内容会随着首批页面一起补充。"
                      : "More related pages will appear as the first batch grows."}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </ContentSiteLayout>
  );
};
