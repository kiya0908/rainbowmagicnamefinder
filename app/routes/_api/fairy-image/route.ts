import { parseFairyImageSource } from "~/features/fairy-finder/utils/image";

const IMAGE_CACHE_CONTROL = "public, max-age=86400, s-maxage=2592000";

export const loader = async ({ request }: { request: Request }) => {
  const requestUrl = new URL(request.url);
  const source = requestUrl.searchParams.get("src");

  if (!source) {
    return new Response("Missing src", { status: 400 });
  }

  const imageUrl = parseFairyImageSource(source);
  if (!imageUrl) {
    return new Response("Unsupported image source", { status: 400 });
  }

  const upstreamResponse = await fetch(imageUrl.toString(), {
    headers: {
      Accept: "image/*",
    },
  });

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return new Response("Upstream image unavailable", { status: 502 });
  }

  const headers = new Headers();
  const contentType = upstreamResponse.headers.get("Content-Type");
  const contentLength = upstreamResponse.headers.get("Content-Length");
  const etag = upstreamResponse.headers.get("ETag");
  const lastModified = upstreamResponse.headers.get("Last-Modified");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  if (etag) {
    headers.set("ETag", etag);
  }

  if (lastModified) {
    headers.set("Last-Modified", lastModified);
  }

  headers.set("Cache-Control", IMAGE_CACHE_CONTROL);
  headers.set("X-Robots-Tag", "noindex");

  return new Response(upstreamResponse.body, {
    status: 200,
    headers,
  });
};
