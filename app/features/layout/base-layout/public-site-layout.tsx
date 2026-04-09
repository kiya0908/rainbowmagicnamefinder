import clsx from "clsx";

import { getLinkedinTranslatorHomePageCopy } from "~/features/linkedin-translator/i18n";

import { Footer } from "./footer";
import {
  MarketingHeader,
  MarketingHeaderLocaleSwitch,
  type MarketingHeaderNavLink,
} from "./marketing-header";

type PublicSiteLocale = "en" | "zh";
type PublicSitePrimaryNav = "blog";

interface PublicSiteLayoutProps {
  locale: PublicSiteLocale;
  localeSwitchTo: string;
  activePrimaryNav?: PublicSitePrimaryNav;
  logoTo?: string;
  className?: string;
  mainClassName?: string;
  children: React.ReactNode;
}

const getPublicSiteHomePath = (locale: PublicSiteLocale) =>
  locale === "zh" ? "/zh" : "/";

const getPublicSiteBlogPath = (locale: PublicSiteLocale) =>
  locale === "zh" ? "/zh/blog" : "/blog";

const getPublicSiteLocaleSwitchLabel = (locale: PublicSiteLocale) =>
  locale === "en" ? "中文" : "English";

const normalizePrimaryNavHref = (href: string, locale: PublicSiteLocale) =>
  href.startsWith("#") ? `${getPublicSiteHomePath(locale)}${href}` : href;

export const PublicSiteLayout = ({
  locale,
  localeSwitchTo,
  activePrimaryNav,
  logoTo,
  className,
  mainClassName,
  children,
}: PublicSiteLayoutProps) => {
  const homeCopy = getLinkedinTranslatorHomePageCopy(locale);
  const homePath = logoTo ?? getPublicSiteHomePath(locale);
  const primaryNavLinks: MarketingHeaderNavLink[] = homeCopy.navbar.navLinks.map(
    (item) => {
      const to = normalizePrimaryNavHref(item.href, locale);
      const isActive =
        activePrimaryNav === "blog" && to === getPublicSiteBlogPath(locale);

      return {
        to,
        label: item.label,
        className: isActive ? "text-primary font-semibold" : undefined,
      };
    }
  );

  return (
    <div className={clsx("min-h-screen bg-surface flex flex-col", className)}>
      <MarketingHeader
        logoAlt={homeCopy.navbar.logoAlt}
        logoTo={homePath}
        navLinks={primaryNavLinks}
        signInLabel={homeCopy.navbar.signIn}
        creditsLabel={homeCopy.navbar.credits}
        rightSlot={
          <MarketingHeaderLocaleSwitch
            to={localeSwitchTo}
            label={getPublicSiteLocaleSwitchLabel(locale)}
          />
        }
      />

      <main className={clsx("flex-1", mainClassName)}>{children}</main>

      <Footer
        brandTo={homePath}
        navLinks={homeCopy.footer.navLinks}
        description={homeCopy.footer.description}
        directoryBadgeTitle={homeCopy.footer.directoryBadgeTitle}
      />
    </div>
  );
};
