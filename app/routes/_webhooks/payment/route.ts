import type { Route } from "./+types/route";

import {
  handleOrderComplete,
  handleOrderRefund,
  handleSubscriptionCanceled,
  handleSubscriptionExpired,
  handleSubscriptionRenewal,
} from "~/.server/services/order";
import { isIgnorableWebhookPaymentError } from "~/.server/services/order-errors";
import { getOrderBySessionId } from "~/.server/model/order";
import { createCreem } from "~/.server/libs/creem";
import type {
  WebhookBody,
  Checkout,
  Refund,
  Subscription,
} from "~/.server/libs/creem/types";

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method.toLowerCase() !== "post") {
    return new Response("Fail Method", { status: 405 });
  }
  const body = await request.text();

  const creemSignature = request.headers.get("creem-signature");
  const creem = createCreem();
  const signature = creem.createWebhookSignature(body);

  try {
    if (creemSignature !== signature) {
      throw Error("Invalid Signature");
    }

    const { eventType, ...rest } = JSON.parse(body) as WebhookBody;

    if (eventType === "checkout.completed") {
      const checkout = rest.object as Checkout;
      const localOrder = await getOrderBySessionId(checkout.id);
      if (!localOrder) {
        console.log(
          `Ignore checkout.completed: local order not found for checkout ${checkout.id}`
        );
      } else {
        await handleOrderComplete(checkout.id);
      }
    } else if (eventType === "refund.created") {
      const refund = rest.object as Refund;
      const checkoutId = (refund as { checkout?: { id?: string } }).checkout?.id;

      // Some simulated test payloads omit checkout details.
      if (checkoutId) {
        const localOrder = await getOrderBySessionId(checkoutId);
        if (!localOrder) {
          console.log(
            `Ignore refund.created: local order not found for checkout ${checkoutId}`
          );
        } else {
          await handleOrderRefund(checkoutId);
        }
      } else {
        console.log("Ignore refund.created: payload does not include checkout.id");
      }
    } else if (eventType === "subscription.canceled") {
      const sub = rest.object as Subscription;
      await handleSubscriptionCanceled(sub.id);
    } else if (eventType === "subscription.expired") {
      const sub = rest.object as Subscription;
      await handleSubscriptionExpired(sub.id);
    } else if (eventType === "subscription.paid") {
      const sub = rest.object as Subscription;
      await handleSubscriptionRenewal(sub.id);
    }

    return Response.json({}, { status: 200 });
  } catch (error) {
    const message = (error as Error).message;

    // For dashboard-simulated events with foreign IDs, acknowledge to avoid retries.
    if (isIgnorableWebhookPaymentError(message)) {
      console.log("Ignore webhook event: ", message);
      return Response.json({ ignored: true, message }, { status: 200 });
    }

    console.log("Error Event: ", body);
    console.log("Error Message: ", message);

    return Response.json({ message }, { status: 400 });
  }
};
