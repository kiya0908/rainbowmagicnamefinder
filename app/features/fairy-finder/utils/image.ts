const FAIRY_IMAGE_PROXY_PATH = "/api/fairy-image";
const ALLOWED_FAIRY_IMAGE_HOSTS = new Set([
  "orchardseriesbooks.co.uk",
  "www.orchardseriesbooks.co.uk",
]);
const ALLOWED_FAIRY_IMAGE_PATH_PREFIX = "/wp-content/uploads/";

export function getFairyImageSrc(imageUrl: string): string {
  if (!imageUrl || !/^https:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const searchParams = new URLSearchParams({ src: imageUrl });
  return `${FAIRY_IMAGE_PROXY_PATH}?${searchParams.toString()}`;
}

export function parseFairyImageSource(imageUrl: string): URL | null {
  try {
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.protocol !== "https:") {
      return null;
    }

    if (!ALLOWED_FAIRY_IMAGE_HOSTS.has(parsedUrl.hostname)) {
      return null;
    }

    if (!parsedUrl.pathname.startsWith(ALLOWED_FAIRY_IMAGE_PATH_PREFIX)) {
      return null;
    }

    return parsedUrl;
  } catch {
    return null;
  }
}
