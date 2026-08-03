import { useState } from "react";

import { Link } from "~/components/common";

import {
  type CookieConsent,
  writeCookieConsent,
} from "./cookie-consent";

interface CookieConsentBannerProps {
  consentStatus: CookieConsent | null;
  isReady: boolean;
  onConsentChange: (value: CookieConsent) => void;
}

export const CookieConsentBanner = ({
  consentStatus,
  isReady,
  onConsentChange,
}: CookieConsentBannerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isReady) return null;

  const choose = (value: CookieConsent) => {
    const mustReload = consentStatus === "accepted" && value === "rejected";

    writeCookieConsent(value);
    onConsentChange(value);
    setIsOpen(false);

    // A reload stops third-party code that may already be running after consent.
    if (mustReload) window.location.reload();
  };

  if (consentStatus !== null && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[60] inline-flex min-h-10 items-center rounded-full border border-outline-variant bg-white px-4 text-xs font-bold text-on-surface-variant shadow-lg transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Cookie settings
      </button>
    );
  }

  return (
    <section
      aria-label="Cookie preferences"
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-gray-200 bg-white p-4 shadow-2xl"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-gray-700">
          We use necessary technologies to operate this site. With your
          permission, we also use analytics and contextual, non-personalized
          advertising. These services may use cookies or similar identifiers
          for measurement, frequency capping, security, and fraud prevention.{" "}
          <Link
            to="/legal/cookies"
            className="font-bold text-primary underline underline-offset-2"
          >
            Learn more
          </Link>
          .
        </p>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-primary bg-white px-5 text-sm font-bold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Accept
          </button>
        </div>
      </div>
    </section>
  );
};
