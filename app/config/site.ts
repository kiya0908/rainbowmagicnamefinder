export const SITE_NAME = "Rainbow Magic Fairy Name Finder";
export const SITE_ORIGIN = "https://rainbowmagicfairyname.online";
export const SITE_HOSTNAME = new URL(SITE_ORIGIN).hostname;
export const SITE_SUPPORT_EMAIL = "support@rainbowmagicfairyname.online";
export const SITE_SUPPORT_MAILTO = `mailto:${SITE_SUPPORT_EMAIL}`;

const DISALLOWED_SEO_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127(?:\.\d{1,3}){3}$/i,
  /\.workers\.dev$/i,
  /\.pages\.dev$/i,
  /\.vercel\.app$/i,
  /\.netlify\.app$/i,
  /preview/i,
  /temporary/i,
];

function normalizeOrigin(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.origin;
  } catch {
    return null;
  }
}

function isDisallowedSeoHostname(hostname: string) {
  return DISALLOWED_SEO_HOSTNAME_PATTERNS.some((pattern) =>
    pattern.test(hostname)
  );
}

export function getSiteOrigin(candidate?: string | null) {
  const normalizedOrigin = normalizeOrigin(candidate);

  if (!normalizedOrigin) {
    return SITE_ORIGIN;
  }

  const { hostname } = new URL(normalizedOrigin);

  if (isDisallowedSeoHostname(hostname)) {
    return SITE_ORIGIN;
  }

  return hostname === SITE_HOSTNAME || hostname === `www.${SITE_HOSTNAME}`
    ? SITE_ORIGIN
    : SITE_ORIGIN;
}

export function toSiteUrl(pathname: string, origin?: string | null) {
  return new URL(pathname, `${getSiteOrigin(origin)}/`).toString();
}
