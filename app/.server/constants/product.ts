import {
  LINKEDIN_TRANSLATOR_PRO_PACK,
  LINKEDIN_TRANSLATOR_TEAM_PLAN,
} from "~/features/linkedin-translator/pricing";

export interface PRODUCT {
  price: number;
  credits: number;
  product_id: string;
  product_name: string;
  product_description: string;
  type: "once" | "monthly" | "yearly";
}

export const CREDITS_PRODUCT: PRODUCT = {
  price: LINKEDIN_TRANSLATOR_PRO_PACK.price,
  credits: LINKEDIN_TRANSLATOR_PRO_PACK.credits,
  product_id: LINKEDIN_TRANSLATOR_PRO_PACK.productId,
  product_name: LINKEDIN_TRANSLATOR_PRO_PACK.name,
  product_description:
    "One-time LinkedIn Translator credit pack for usage-based rewriting. Unlocks Extreme intensity and deducts 1 credit per successful translation.",
  type: "once",
};

export const TEAM_CREDITS_PRODUCT: PRODUCT | null =
  LINKEDIN_TRANSLATOR_TEAM_PLAN.productId
    ? {
        price: LINKEDIN_TRANSLATOR_TEAM_PLAN.price,
        credits: LINKEDIN_TRANSLATOR_TEAM_PLAN.credits,
        product_id: LINKEDIN_TRANSLATOR_TEAM_PLAN.productId,
        product_name: LINKEDIN_TRANSLATOR_TEAM_PLAN.name,
        product_description:
          "Larger LinkedIn Translator credit pack for heavier usage. Unlocks Extreme intensity and deducts 1 credit per successful translation.",
        type: "once",
      }
    : null;

export const PRODUCTS_LIST = [CREDITS_PRODUCT, TEAM_CREDITS_PRODUCT].filter(
  (item): item is PRODUCT => Boolean(item)
);
