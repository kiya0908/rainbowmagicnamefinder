import { CREEM_ACTIVE_PRODUCT_IDS } from "../../constants/pricing.js";

export interface PRODUCT {
  price: number;
  credits: number;
  product_id: string;
  product_name: string;
  product_description: string;
  type: "once" | "monthly" | "yearly";
}

const CREDIT_PACK = {
  productId: CREEM_ACTIVE_PRODUCT_IDS.credits,
  name: "Fairy Credit Pack",
  price: 4.9,
  credits: 200,
} as const;

export const CREDITS_PRODUCT: PRODUCT = {
  price: CREDIT_PACK.price,
  credits: CREDIT_PACK.credits,
  product_id: CREDIT_PACK.productId,
  product_name: CREDIT_PACK.name,
  product_description: "One-time credit pack for Rainbow Magic Fairy Name Finder.",
  type: "once",
};

export const PRODUCTS_LIST = [CREDITS_PRODUCT];
