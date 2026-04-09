import type { Route } from "./+types/route";
import { nanoid } from "nanoid";
import { z } from "zod";

import {
  MAX_TRANSLATION_INPUT_CHARS,
  type TranslationIntensity,
  type TranslationMode,
} from "~/features/linkedin-translator/config";
import {
  resolveLinkedinTranslationAccess,
  settleLinkedinTranslationUsage,
} from "~/.server/services/linkedin-translator";
import { translateLinkedinText } from "~/.server/services/linkedin-translation-provider";

const requestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Text cannot be empty")
    .max(MAX_TRANSLATION_INPUT_CHARS, "Text is too long"),
  mode: z
    .enum(["human-to-linkedin", "linkedin-to-human"])
    .default("human-to-linkedin"),
  intensity: z.enum(["light", "standard", "extreme"]).default("standard"),
});

export interface LinkedinTranslateResult {
  text: string;
  meta: {
    requestId: string;
    latencyMs: number;
    mode: TranslationMode;
    intensity: TranslationIntensity;
    chargedCredits: number;
    providerModel: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    entitlement: Awaited<
      ReturnType<typeof settleLinkedinTranslationUsage>
    >;
  };
}

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method.toLowerCase() !== "post") {
    throw new Response("Not Found", { status: 404 });
  }

  const requestId = nanoid();
  const startedAt = Date.now();
  const headers = new Headers();

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request payload";
    throw new Response(message, { status: 400 });
  }

  const access = await resolveLinkedinTranslationAccess(request);
  if (access.cookieHeader) {
    headers.set("Set-Cookie", access.cookieHeader);
  }

  if (
    parsed.data.intensity === "extreme" &&
    !access.entitlement.canUseExtreme
  ) {
    throw new Response("Extreme mode requires paid credits.", {
      status: 402,
      headers,
    });
  }

  if (!access.entitlement.canTranslate) {
    throw new Response("Daily quota reached. Upgrade to continue.", {
      status: 402,
      headers,
    });
  }

  if (access.entitlement.state === "pro") {
    const creditsRequiredPerRequest = 1;
    if (access.entitlement.credits < creditsRequiredPerRequest) {
      throw new Response(
        "Not enough credits for this translation. At least 1 credit is required.",
        {
          status: 402,
          headers,
        }
      );
    }
  }

  try {
    const translation = await translateLinkedinText({
      text: parsed.data.text,
      mode: parsed.data.mode as TranslationMode,
      intensity: parsed.data.intensity as TranslationIntensity,
    });

    const chargedCredits = access.entitlement.state === "pro" ? 1 : 0;
    const nextEntitlement = await settleLinkedinTranslationUsage(access, {
      creditsToCharge: chargedCredits,
      requestId,
      mode: parsed.data.mode as TranslationMode,
      intensity: parsed.data.intensity as TranslationIntensity,
    });
    const latencyMs = Date.now() - startedAt;

    console.info("linkedin_translation_success", {
      requestId,
      latencyMs,
      mode: parsed.data.mode,
      intensity: parsed.data.intensity,
      state: access.entitlement.state,
      chargedCredits,
      inputChars: parsed.data.text.length,
      promptTokens: translation.usage.promptTokens,
      completionTokens: translation.usage.completionTokens,
      providerModel: translation.providerModel,
    });

    return Response.json(
      {
        text: translation.text,
        meta: {
          requestId,
          latencyMs,
          mode: parsed.data.mode,
          intensity: parsed.data.intensity,
          chargedCredits,
          providerModel: translation.providerModel,
          usage: translation.usage,
          entitlement: nextEntitlement,
        },
      } satisfies LinkedinTranslateResult,
      { headers }
    );
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code !== "undefined"
        ? String(error.code)
        : "translation_failed";
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string"
          ? error.message
          : "Translation request failed";

    console.error("linkedin_translation_error", {
      requestId,
      latencyMs,
      mode: parsed.data.mode,
      intensity: parsed.data.intensity,
      state: access.entitlement.state,
      inputChars: parsed.data.text.length,
      errorCode: code,
      message,
    });

    throw new Response(message, { status, headers });
  }
};
