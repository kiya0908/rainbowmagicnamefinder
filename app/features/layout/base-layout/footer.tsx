//公共布局 footer组件
import { Image, Link } from "~/components/common";
import {
  SITE_HOSTNAME,
  SITE_ORIGIN,
  SITE_SUPPORT_EMAIL,
  SITE_SUPPORT_MAILTO,
} from "~/config/site";

import { DirectoryBadges, type DirectoryBadgeItem } from "./directory-badges";
import { DIRECTORY_BADGE_ITEMS } from "./directory-badges.config";

interface FooterLinkItem {
  to: string;
  label: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
}

export interface FooterNavLink {
  label: string;
  list: FooterLinkItem[];
}

export interface FooterProps {
  navLinks?: FooterNavLink[];
  brandName?: string;
  brandTo?: string;
  description?: string;
  directoryBadges?: DirectoryBadgeItem[];
  directoryBadgeTitle?: string;
}

const DEFAULT_FOOTER_LINKS: FooterNavLink[] = [
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
      { to: "/legal/terms", label: "Terms of Service" },
      { to: "/legal/cookie", label: "Cookie Policy" },
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
];

export const Footer = ({
  navLinks,
  brandName = "Rainbow Magic Fairy Name Finder",
  brandTo = "/",
  description = "Find your Rainbow Magic fairy identity in seconds and share it with friends.",
  directoryBadges,
  directoryBadgeTitle,
}: FooterProps) => {
  const footerLinks = navLinks?.length ? navLinks : DEFAULT_FOOTER_LINKS;
  const badgeItems = directoryBadges ?? DIRECTORY_BADGE_ITEMS;

  return (
    <footer className="bg-surface py-20 px-6 border-t border-outline-variant">
      <div className="max-w-7xl mx-auto flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="lg:max-w-md">
          <Link to={brandTo} className="inline-flex items-center gap-2 mb-6">
            <Image
              className="w-6 h-6 rounded object-contain"
              src="/assets/favicon-16x16.png"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            <span className="font-display font-bold text-lg text-primary">
              {brandName}
            </span>
          </Link>
          <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
            {description}
          </p>
          <p className="text-[10px] text-on-surface-variant/40 mt-8">
            (c) {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
        </div>

        <div className="grid flex-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.label}>
              <p className="font-bold text-xs uppercase tracking-widest text-on-surface-variant/60 mb-6">
                {group.label}
              </p>
              <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
                {group.list.map((item) => (
                  <li key={`${group.label}-${item.to}-${item.label}`}>
                    <Link
                      to={item.to}
                      target={item.target}
                      rel={
                        item.target === "_blank"
                          ? item.rel ?? "noopener noreferrer"
                          : item.rel
                      }
                      className="hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {/* 导航站链接 */}
      <DirectoryBadges items={badgeItems} title={directoryBadgeTitle} />
    </footer>
  );
};

