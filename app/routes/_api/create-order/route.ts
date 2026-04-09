import type { Route } from "./+types/route";
import { data } from "react-router";

import { getSessionHandler } from "~/.server/libs/session";
import { createOrder } from "~/.server/services/order";

import { PRODUCTS_LIST, PRICING_LIST } from "~/.server/constants";

export async function action({ request }: Route.ActionArgs) {
  const raw = (await request.json()) as { product_id?: string };
  const productId = raw.product_id;
  const successOrigin = new URL(request.url).origin;

  if (!productId) {
    throw new Response("Bad Request", { status: 400 });
  }

  const [session] = await getSessionHandler(request);
  const user = session.get("user");
  if (!user) throw new Response("Unauthorized", { status: 401 });

  // One-time products (credits packs, etc.)
  const oneTimeProduct = PRODUCTS_LIST.find((item) => item.product_id === productId);
  if (oneTimeProduct) {
    const result = await createOrder(
      {
        credits: oneTimeProduct.credits,
        price: oneTimeProduct.price,
        product_id: oneTimeProduct.product_id,
        product_name: oneTimeProduct.product_name,
        type: oneTimeProduct.type,
      },
      user,
      { successOrigin }
    );

    return data(result);
  }

  // Subscription products from pricing plans.
  for (const plan of PRICING_LIST) {
    if (!plan.product_id) continue;

    if (plan.product_id.monthly && plan.product_id.monthly === productId) {
      const result = await createOrder(
        {
          price: plan.price.monthly,
          product_id: productId,
          product_name: `${plan.name} Monthly`,
          type: "monthly",
          plan_id: plan.id,
        },
        user,
        { successOrigin }
      );

      return data(result);
    }

    if (plan.product_id.yearly && plan.product_id.yearly === productId) {
      const result = await createOrder(
        {
          price: plan.price.yearly,
          product_id: productId,
          product_name: `${plan.name} Yearly`,
          type: "yearly",
          plan_id: plan.id,
        },
        user,
        { successOrigin }
      );

      return data(result);
    }
  }

  throw new Response("Not Found", { status: 404 });
}
