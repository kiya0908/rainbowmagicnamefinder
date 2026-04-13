import clsx from "clsx";
import { useState } from "react";

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

  return (
    <header className="sticky top-0 z-50 glass border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to={logoTo} className="flex items-center gap-2">
          <img
            src="/assets/favicon-32x32.png"
            alt={logoAlt}
            width={32}
            height={32}
            decoding="async"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-display font-bold text-xl text-primary">
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
          <div className="flex items-center gap-3">
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
            className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            {creditsLabel}: {credits}
          </Link>
        ) : (
          <LazyGoogleOAuth className="max-md:btn-sm" label={signInLabel} />
        )}
      </div>
    </header>
  );
}
