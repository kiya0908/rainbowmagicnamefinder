import { env } from "cloudflare:workers";
import { CreemApiClient } from "./client";

export const createCreem = () => {
  if (import.meta.env.PROD) {
    return new CreemApiClient(
      "https://api.creem.io",
      env.CREEM_KEY,
      env.CREEM_WEBHOOK_SECRET
    );
  }

  return new CreemApiClient(
    "https://test-api.creem.io",
    env.CREEM_TEST_KEY,
    env.CREEM_WEBHOOK_SECRET
  );
};
