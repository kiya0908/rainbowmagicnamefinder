import type { RenderableTreeNodes } from "@markdoc/markdoc";

import { Logo, Link } from "~/components/common";
import { MarkdownArticle } from "~/components/markdown";
import { PublicSiteLayout } from "~/features/layout/base-layout/public-site-layout";

type PublicSiteLocale = "en" | "zh";

interface LegalProps {
  node: RenderableTreeNodes;
  withHomeChrome?: boolean;
  locale?: PublicSiteLocale;
}

const getHomePath = (locale: PublicSiteLocale) =>
  locale === "zh" ? "/zh" : "/";

const getLocaleSwitchPath = (locale: PublicSiteLocale) =>
  getHomePath(locale === "en" ? "zh" : "en");

export const Legal = ({
  node,
  withHomeChrome = false,
  locale = "en",
}: LegalProps) => {
  if (!withHomeChrome) {
    return (
      <div className="container py-4 sm:py-16 md:py-24">
        <div className="max-w-3xl mx-auto relative">
          <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
            <Link to="/">
              <Logo
                className="mr-2"
                size="lg"
                label="Rainbow Magic Fairy Name Finder"
                imageAlt="Rainbow Magic Fairy Name Finder logo"
              />
            </Link>
          </div>
          <MarkdownArticle className="bg-white p-4 sm:p-6 md:p-8" node={node} />
        </div>
      </div>
    );
  }

  return (
    <PublicSiteLayout
      locale={locale}
      localeSwitchTo={getLocaleSwitchPath(locale)}
      mainClassName="bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_56%)] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20"
    >
      <section className="mx-auto w-full max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] border border-outline-variant bg-white/95 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />

          <div className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <MarkdownArticle
              className="mx-auto max-w-[78ch] md:text-lg [&_h1]:mt-0 [&_h1]:mb-10 [&_h1]:text-4xl md:[&_h1]:text-5xl [&_h1]:font-black [&_h1]:text-primary [&_h1]:border-b-2 [&_h1]:border-primary/30 [&_h1]:pb-5 [&_h2]:mt-14 [&_h2]:mb-6 [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:text-on-surface [&_h2]:border-l-4 [&_h2]:border-primary [&_h2]:bg-primary/5 [&_h2]:pl-4 [&_h2]:py-2 [&_h2]:rounded-r-md [&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:text-xl md:[&_h3]:text-2xl [&_p]:my-5 [&_p]:leading-8 [&_ul]:my-5 [&_ol]:my-5 [&_li]:my-2 [&_blockquote]:my-8 [&_table]:my-8"
              node={node}
            />
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  );
};
