import clsx from "clsx";

import { AdsterraNativeAd } from "~/features/layout/base-layout/adsterra-native-ad";
import { Footer, type FooterNavLink } from "~/features/layout/base-layout/footer";
import {
  MarketingHeader,
  type MarketingHeaderNavLink,
} from "~/features/layout/base-layout/marketing-header";

import {
  FAIRY_FINDER_PRODUCT_NAME,
  getFairyFinderHomeCopy,
} from "./i18n";

interface FairySiteLayoutProps {
  className?: string;
  mainClassName?: string;
  children: React.ReactNode;
}

const normalizeFairySitePath = (path: string) =>
  path.startsWith("#") ? `/${path}` : path;

export const FairySiteLayout = ({
  className,
  mainClassName,
  children,
}: FairySiteLayoutProps) => {
  const copy = getFairyFinderHomeCopy("en");

  const headerNavLinks: MarketingHeaderNavLink[] = copy.navbar.navLinks.map(
    (item) => ({
      to: normalizeFairySitePath(item.href),
      label: item.label,
      variant: item.variant,
    })
  );

  const footerNavLinks: FooterNavLink[] = copy.footer.navLinks.map((group) => ({
    label: group.label,
    list: group.list.map((item) => ({
      to: normalizeFairySitePath(item.to),
      label: item.label,
      target: item.target as React.HTMLAttributeAnchorTarget | undefined,
    })),
  }));

  return (
    <div className={clsx("fairy-site-layout flex min-h-screen flex-col bg-surface", className)}>
      <style>
        {`
          .fairy-site-layout .fairy-header-no-auth .btn.btn-primary {
            display: none;
          }
        `}
      </style>

      <div className="fairy-header-no-auth sticky top-0 z-50">
        <MarketingHeader
          logoAlt={copy.navbar.logoAlt}
          logoLabel={FAIRY_FINDER_PRODUCT_NAME}
          logoTo="/"
          navLinks={headerNavLinks}
          signInLabel={copy.navbar.signIn}
          creditsLabel={copy.navbar.credits}
        />
      </div>

      <main className={clsx("flex-1", mainClassName)}>{children}</main>

      <AdsterraNativeAd />

      <Footer
        brandName={FAIRY_FINDER_PRODUCT_NAME}
        brandTo="/"
        description={copy.footer.description}
        navLinks={footerNavLinks}
        directoryBadgeTitle={copy.footer.directoryBadgeTitle}
      />
    </div>
  );
};
