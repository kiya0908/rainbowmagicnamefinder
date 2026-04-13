import clsx from "clsx";
import {
  SITE_HOSTNAME,
  SITE_ORIGIN,
  SITE_SUPPORT_EMAIL,
  SITE_SUPPORT_MAILTO,
} from "~/config/site";

import { Footer, type FooterNavLink } from "./footer";
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

interface PublicSiteCopy {
  navbar: {
    logoAlt: string;
    signIn: string;
    credits: string;
    navLinks: Array<{ href: string; label: string }>;
  };
  footer: {
    directoryBadgeTitle: string;
    navLinks: FooterNavLink[];
  };
}

const PROJECT_FOOTER_DESCRIPTION =
  "Find your Rainbow Magic fairy identity in seconds and share it with friends.";

const PUBLIC_SITE_COPY: Record<PublicSiteLocale, PublicSiteCopy> = {
  en: {
    navbar: {
      logoAlt: "Rainbow Magic Fairy Name Finder logo",
      signIn: "Sign in with Google",
      credits: "Credits",
      navLinks: [
        { href: "/tools", label: "Tools" },
        { href: "/templates", label: "Templates" },
        { href: "/blog", label: "Blog" },
      ],
    },
    footer: {
      directoryBadgeTitle: "Featured in",
      navLinks: [
        {
          label: "Explore",
          list: [
            { to: "/tools", label: "Tools" },
            { to: "/templates", label: "Templates" },
            { to: "/blog", label: "Blog" },
          ],
        },
        {
          label: "Legal",
          list: [
            { to: "/legal/privacy", label: "Privacy Policy" },
            { to: "/legal/terms", label: "Terms of Use" },
            { to: "/legal/cookie", label: "Cookie Policy" },
            { to: "/legal/acceptable-use", label: "Acceptable Use Policy" },
            { to: "/legal/refund", label: "Refund Policy" },
          ],
        },
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
      signIn: "Google 登录",
      credits: "积分",
      navLinks: [
        { href: "/zh/tools", label: "工具" },
        { href: "/zh/templates", label: "模板" },
        { href: "/zh/blog", label: "博客" },
      ],
    },
    footer: {
      directoryBadgeTitle: "收录平台",
      navLinks: [
        {
          label: "导航",
          list: [
            { to: "/zh/tools", label: "工具" },
            { to: "/zh/templates", label: "模板" },
            { to: "/zh/blog", label: "博客" },
          ],
        },
        {
          label: "法务",
          list: [
            { to: "/legal/privacy", label: "隐私政策" },
            { to: "/legal/terms", label: "使用条款" },
            { to: "/legal/cookie", label: "Cookie 政策" },
            { to: "/legal/acceptable-use", label: "可接受使用政策" },
            { to: "/legal/refund", label: "退款政策" },
          ],
        },
        {
          label: "支持",
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
};

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
  const copy = PUBLIC_SITE_COPY[locale];
  const homePath = logoTo ?? getPublicSiteHomePath(locale);
  const footerNavLinks = copy.footer.navLinks;
  const primaryNavLinks: MarketingHeaderNavLink[] = copy.navbar.navLinks.map(
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

      <Footer
        brandTo={homePath}
        navLinks={footerNavLinks}
        description={PROJECT_FOOTER_DESCRIPTION}
        directoryBadgeTitle={copy.footer.directoryBadgeTitle}
      />
    </div>
  );
};
