export const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent_v1";

export type CookieConsent = "accepted" | "rejected";

export const parseCookieConsent = (value: string | null): CookieConsent | null =>
  value === "accepted" || value === "rejected" ? value : null;

export const readCookieConsent = (): CookieConsent | null => {
  try {
    return parseCookieConsent(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    );
  } catch {
    return null;
  }
};

export const writeCookieConsent = (value: CookieConsent) => {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  } catch {
    // The in-memory choice still applies when browser storage is unavailable.
  }
};
