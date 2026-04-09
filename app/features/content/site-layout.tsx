import { PublicSiteLayout } from "~/features/layout/base-layout/public-site-layout";

import type { ContentCollection, ContentLocale } from "./types";
import { getCollectionPath, getHomePath } from "./utils";

interface ContentSiteLayoutProps {
  locale: ContentLocale;
  activeCollection?: ContentCollection;
  alternatePath?: string | null;
  children: React.ReactNode;
}

export const ContentSiteLayout = ({
  locale,
  activeCollection,
  alternatePath,
  children,
}: ContentSiteLayoutProps) => {
  const alternateLocale: ContentLocale = locale === "en" ? "zh" : "en";
  const localeSwitchTo =
    alternatePath ??
    (activeCollection
      ? getCollectionPath(alternateLocale, activeCollection)
      : getHomePath(alternateLocale));

  return (
    <PublicSiteLayout
      locale={locale}
      localeSwitchTo={localeSwitchTo}
      activePrimaryNav={activeCollection === "blog" ? "blog" : undefined}
      logoTo={getHomePath(locale)}
    >
      {children}
    </PublicSiteLayout>
  );
};
