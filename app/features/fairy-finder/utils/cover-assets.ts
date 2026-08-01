const ALLOWED_COVER_HOSTS = new Set([
  "orchardseriesbooks.co.uk",
  "www.orchardseriesbooks.co.uk",
]);
const ALLOWED_COVER_PATH_PREFIX = "/wp-content/uploads/";
const SAFE_COVER_FILENAME = /^[A-Za-z0-9._-]+\.jpe?g$/i;

export const FAIRY_COVER_ASSET_PREFIX = "/assets/fairy-covers/v1/";

export function getFairyCoverAssetPath(sourceUrl: string): string | null {
  try {
    const parsed = new URL(sourceUrl);
    const filename = parsed.pathname.split("/").pop() ?? "";

    if (
      parsed.protocol !== "https:" ||
      !ALLOWED_COVER_HOSTS.has(parsed.hostname) ||
      !parsed.pathname.startsWith(ALLOWED_COVER_PATH_PREFIX) ||
      !SAFE_COVER_FILENAME.test(filename)
    ) {
      return null;
    }

    return `${FAIRY_COVER_ASSET_PREFIX}${encodeURIComponent(filename)}`;
  } catch {
    return null;
  }
}
