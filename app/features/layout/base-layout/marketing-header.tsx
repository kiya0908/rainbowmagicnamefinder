import clsx from "clsx";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Link } from "~/components/common";
import { GoogleOAuth } from "~/features/oauth/google";
import { useUser } from "~/store";

export interface MarketingHeaderNavLink {
  to: string;
  label: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  className?: string;
}

interface MarketingHeaderProps {
  logoAlt: string;
  navLinks: MarketingHeaderNavLink[];
  signInLabel: string;
  creditsLabel: string;
  logoLabel?: string;
  logoTo?: string;
  rightSlot?: React.ReactNode;
}

interface LazyGoogleOAuthProps {
  className?: string;
  label: string;
}

interface MarketingHeaderLocaleSwitchProps {
  to: string;
  label: string;
  className?: string;
}

function LazyGoogleOAuth({ className, label }: LazyGoogleOAuthProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  if (shouldLoad) {
    return <GoogleOAuth />;
  }

  return (
    <button
      type="button"
      className={`btn btn-primary ${className ?? ""}`.trim()}
      onClick={() => setShouldLoad(true)}
    >
      {label}
    </button>
  );
}

export function MarketingHeaderLocaleSwitch({
  to,
  label,
  className,
}: MarketingHeaderLocaleSwitchProps) {
  return (
    <Link
      to={to}
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:border-primary/30 hover:text-primary max-md:px-3 max-md:py-1.5 max-md:text-xs",
        className
      )}
    >
      {label}
    </Link>
  );
}

export function MarketingHeader({
  logoAlt,
  navLinks,
  signInLabel,
  creditsLabel,
  logoLabel = "Rainbow Magic Fairy Name Finder",
  logoTo = "/",
  rightSlot,
}: MarketingHeaderProps) {
  const user = useUser((state) => state.user);
  const credits = useUser((state) => state.credits);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between md:h-20 md:px-6">
        <Link to={logoTo} className="flex items-center gap-2">
          <img
            src="/assets/favicon-32x32.png"
            alt={logoAlt}
            width={32}
            height={32}
            decoding="async"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-display text-base font-bold leading-tight text-primary md:text-xl">
            {logoLabel}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={`${item.to}-${item.label}`}
              to={item.to}
              target={item.target}
              rel={
                item.target === "_blank"
                  ? item.rel ?? "noopener noreferrer"
                  : item.rel
              }
              className={clsx(
                "text-sm font-medium text-on-surface-variant hover:text-primary transition-colors",
                item.className
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {rightSlot ? (
          <div className="hidden items-center gap-3 md:flex">
            {rightSlot}
            {user ? (
              <Link
                to="/base/credits"
                className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
              >
                {creditsLabel}: {credits}
              </Link>
            ) : (
              <LazyGoogleOAuth className="max-md:btn-sm" label={signInLabel} />
            )}
          </div>
        ) : user ? (
          <Link
            to="/base/credits"
            className="hidden bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm md:inline-flex"
          >
            {creditsLabel}: {credits}
          </Link>
        ) : (
          <LazyGoogleOAuth className="hidden md:inline-flex" label={signInLabel} />
        )}

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface transition hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15 md:hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-site-menu"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="mobile-site-menu"
        className={clsx(
          "md:hidden overflow-hidden border-t border-outline-variant bg-white/95 backdrop-blur transition-all duration-200",
          isMobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav aria-label="Mobile navigation" className="px-4 py-3">
          <div className="grid gap-1">
            {navLinks.map((item) => (
              <Link
                key={`${item.to}-${item.label}-mobile`}
                to={item.to}
                target={item.target}
                rel={
                  item.target === "_blank"
                    ? item.rel ?? "noopener noreferrer"
                    : item.rel
                }
                className="rounded-xl px-3 py-3 text-sm font-semibold text-on-surface-variant transition hover:bg-secondary-fixed/35 hover:text-primary"
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {user ? (
            <Link
              to="/base/credits"
              className="mt-2 inline-flex rounded-xl px-3 py-2 text-xs font-semibold text-on-surface-variant"
              onClick={closeMobileMenu}
            >
              {creditsLabel}: {credits}
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
