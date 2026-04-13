import { CREEM_ACTIVE_PRODUCT_IDS } from "../../constants/pricing.js";

export interface PRODUCT {
  price: number;
  credits: number;
  product_id: string;
  product_name: string;
  product_description: string;
  type: "once" | "monthly" | "yearly";
}

const LEGACY_CREDIT_PACK = {
  productId: CREEM_ACTIVE_PRODUCT_IDS.linkedinCredit200,
  name: "Legacy Credit Pack",
  price: 4.9,
  credits: 200,
} as const;

const LEGACY_TEAM_PACK = {
  productId: CREEM_ACTIVE_PRODUCT_IDS.linkedinCredit500,
  name: "Legacy Team Credit Pack",
  price: 9.9,
  credits: 500,
} as const;

export const CREDITS_PRODUCT: PRODUCT = {
  price: LEGACY_CREDIT_PACK.price,
  credits: LEGACY_CREDIT_PACK.credits,
  product_id: LEGACY_CREDIT_PACK.productId,
  product_name: LEGACY_CREDIT_PACK.name,
  product_description:
    "Legacy one-time credit pack kept only for backward compatibility.",
  type: "once",
};

export const TEAM_CREDITS_PRODUCT: PRODUCT | null = LEGACY_TEAM_PACK.productId
  ? {
      price: LEGACY_TEAM_PACK.price,
      credits: LEGACY_TEAM_PACK.credits,
      product_id: LEGACY_TEAM_PACK.productId,
      product_name: LEGACY_TEAM_PACK.name,
      product_description:
        "Legacy larger one-time credit pack kept only for backward compatibility.",
      type: "once",
    }
  : null;

export const PRODUCTS_LIST = [CREDITS_PRODUCT, TEAM_CREDITS_PRODUCT].filter(
  (item): item is PRODUCT => Boolean(item)
);
