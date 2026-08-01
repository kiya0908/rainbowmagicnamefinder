import clsx from "clsx";

import {
  SITE_HOSTNAME,
  SITE_ORIGIN,
  SITE_SUPPORT_EMAIL,
  SITE_SUPPORT_MAILTO,
} from "~/config/site";

import { AdsterraNativeAd } from "./adsterra-native-ad";
import { Footer, type FooterNavLink } from "./footer";
import {
  MarketingHeader,
  MarketingHeaderLocaleSwitch,
  type MarketingHeaderNavLink,
} from "./marketing-header";

type PublicSiteLocale = "en" | "zh";
type PublicSitePrimaryNav = "fairy-names";

interface PublicSiteLayoutProps {
  locale: PublicSiteLocale;
  localeSwitchTo: string;
  activePrimaryNav?: PublicSitePrimaryNav;
  logoTo?: string;
  className?: string;
  mainClassName?: string;
  children: React.ReactNode;
}

interface PublicSiteCopy {
  navbar: {
    logoAlt: string;
    signIn: string;
    credits: string;
    navLinks: Array<{
      href: string;
      label: string;
      variant?: "link" | "cta";
    }>;
  };
  footer: {
    directoryBadgeTitle: string;
    navLinks: FooterNavLink[];
  };
}

const PROJECT_FOOTER_DESCRIPTION =
  "Find your Rainbow Magic fairy identity in seconds and share it with friends.";

const EXPLORE_LINKS = [
  { to: "/fairy-names", label: "Fairy Names" },
  { to: "/#how-it-works", label: "How It Works" },
  { to: "/#what-is", label: "What Is" },
  { to: "/#faq", label: "FAQ" },
];

const LEGAL_LINKS = [
  { to: "/legal/privacy", label: "Privacy Policy" },
  { to: "/legal/terms", label: "Terms of Service" },
  { to: "/legal/cookies", label: "Cookie Policy" },
];

const PUBLIC_SITE_COPY: Record<PublicSiteLocale, PublicSiteCopy> = {
  en: {
    navbar: {
      logoAlt: "Rainbow Magic Fairy Name Finder logo",
      signIn: "Sign in with Google",
      credits: "Credits",
      navLinks: [
        { href: "/fairy-names", label: "Fairy Names" },
        {
          href: "/#fairy-input-zone",
          label: "Find My Fairy",
          variant: "cta",
        },
        { href: "/#what-is", label: "What Is" },
        { href: "/#faq", label: "FAQ" },
      ],
    },
    footer: {
      directoryBadgeTitle: "Featured in",
      navLinks: [
        { label: "Explore", list: EXPLORE_LINKS },
        { label: "Legal", list: LEGAL_LINKS },
        {
          label: "Support",
          list: [
            {
              to: SITE_SUPPORT_MAILTO,
              label: SITE_SUPPORT_EMAIL,
              target: "_blank",
            },
            {
              to: SITE_ORIGIN,
              label: SITE_HOSTNAME,
              target: "_blank",
            },
          ],
        },
      ],
    },
  },
  zh: {
    navbar: {
      logoAlt: "Rainbow Magic Fairy Name Finder logo",
      signIn: "Sign in with Google",
      credits: "Credits",
      navLinks: [
        { href: "/fairy-names", label: "Fairy Names" },
        {
          href: "/#fairy-input-zone",
          label: "Find My Fairy",
          variant: "cta",
        },
        { href: "/#what-is", label: "What Is" },
        { href: "/#faq", label: "FAQ" },
      ],
    },
    footer: {
      directoryBadgeTitle: "Featured in",
      navLinks: [
        { label: "Explore", list: EXPLORE_LINKS },
        { label: "Legal", list: LEGAL_LINKS },
      ],
    },
  },
};

const getPublicSiteHomePath = (locale: PublicSiteLocale) =>
  locale === "zh" ? "/zh" : "/";

const getPublicSiteLocaleSwitchLabel = (locale: PublicSiteLocale) =>
  locale === "en" ? "Home" : "Home";

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
  const copy = PUBLIC_SITE_COPY[locale];
  const homePath = logoTo ?? getPublicSiteHomePath(locale);
  const footerNavLinks = copy.footer.navLinks;
  const primaryNavLinks: MarketingHeaderNavLink[] = copy.navbar.navLinks.map(
    (item) => {
      const to = normalizePrimaryNavHref(item.href, locale);

      return {
        to,
        label: item.label,
        variant: item.variant,
        className:
          activePrimaryNav === "fairy-names" && to === "/fairy-names"
            ? "text-primary font-semibold"
            : undefined,
      };
    }
  );

  return (
    <div className={clsx("min-h-screen bg-surface flex flex-col", className)}>
      <MarketingHeader
        logoAlt={copy.navbar.logoAlt}
        logoTo={homePath}
        navLinks={primaryNavLinks}
        signInLabel={copy.navbar.signIn}
        creditsLabel={copy.navbar.credits}
        rightSlot={
          <MarketingHeaderLocaleSwitch
            to={localeSwitchTo}
            label={getPublicSiteLocaleSwitchLabel(locale)}
          />
        }
      />

      <main className={clsx("flex-1", mainClassName)}>{children}</main>

      <AdsterraNativeAd />

      <Footer
        brandTo={homePath}
        navLinks={footerNavLinks}
        description={PROJECT_FOOTER_DESCRIPTION}
        directoryBadgeTitle={copy.footer.directoryBadgeTitle}
      />
    </div>
  );
};
