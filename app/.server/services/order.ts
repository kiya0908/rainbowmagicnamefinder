import currency from "currency.js";
import dayjs from "dayjs";
import { env } from "cloudflare:workers";

import {
  insertOrder,
  updateOrder,
  getOrderBySessionId,
} from "~/.server/model/order";
import {
  insertSubscription,
  updateSubscription,
  getSubscriptionById,
  getSubscriptionByPlatformId,
} from "~/.server/model/subscriptions";

import {
  insertCreditRecord,
  updateCreditRecord,
  getCreditRecordBySourceId,
} from "~/.server/model/credit_record";
import { insertCreditConsumption } from "~/.server/model/credit_consumptions";

import { createCreem } from "~/.server/libs/creem";
import type { Customer, Subscription } from "~/.server/libs/creem/types";
import type { User } from "~/.server/libs/db";

import { PRICING_LIST, getPlanCreditsByType } from "~/constants/pricing";

function generateUniqueOrderNo(prefix = "ORD") {
  const dateTimePart = dayjs().format("YYYYMMDDHHmmssSSS");
  const randomPart = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  return [prefix, dateTimePart, randomPart].join("");
}

interface CreateOrderOptions {
  // Order type: one-time purchase or subscription.
  type: "once" | "monthly" | "yearly";
  product_id: string;
  product_name: string;
  price: number; // Amount in major currency unit, e.g. 9.9 USD.
  credits?: number; // Credits granted for one-time purchases.
  plan_id?: string; // Internal subscription plan id.
}
interface CreateOrderRuntimeOptions {
  successOrigin?: string;
}

export const createOrder = async (
  payload: CreateOrderOptions,
  user: User,
  options: CreateOrderRuntimeOptions = {}
) => {
  const orderNo = generateUniqueOrderNo();

  const [order] = await insertOrder({
    order_no: orderNo,
    order_detail: payload,
    user_id: user.id,
    product_id: payload.product_id,
    product_name: payload.product_name,
    amount: currency(payload.price).intValue,
    status: "pending",
  });

  const successOrigin =
    options.successOrigin ||
    (import.meta.env.PROD ? env.DOMAIN : "http://localhost:5173");

  const creem = createCreem();
  const session = await creem.createCheckout({
    product_id: order.product_id,
    request_id: order.order_no,
    metadata: {
      referenceId: user.id,
      userId: user.id,
      userEmail: user.email,
      orderNo: order.order_no,
      source: "linkedin-translator",
    },
    customer: { email: user.email },
    success_url: new URL(
      "/callback/payment",
      successOrigin
    ).toString(),
  });

  await updateOrder(order.id, {
    pay_session_id: session.id,
    pay_provider: "creem",
    session_detail: session,
  });

  return session;
};

export const handleOrderComplete = async (checkoutId: string) => {
  const creem = createCreem();
  const checkout = await creem.getCheckout(checkoutId);

  if (!checkout || checkout.status !== "completed") {
    throw Error("Invalid checkout");
  }

  const order = await getOrderBySessionId(checkout.id);
  if (!order) throw Error("Invalid transaction");
  if (order.status === "completed") {
    return order;
  }
  if (order.status !== "pending") {
    throw Error(`Transaction is ${order.status}`);
  }
  const customer = checkout.customer as Customer;
  await updateOrder(order.id, {
    paid_at: new Date(),
    paid_email: customer.email,
    paid_detail: checkout,
    status: "processing",
  });

  const orderDetail = order.order_detail as CreateOrderOptions;
  const { type, credits, plan_id } = orderDetail;

  if (type === "once") {
    if (credits) {
      await insertCreditRecord({
        user_id: order.user_id,
        credits: credits,
        remaining_credits: credits,
        trans_type: "purchase",
        source_type: "order",
        source_id: order.order_no,
      });
    }

    const [result] = await updateOrder(order.id, {
      status: "completed",
    });

    return result;
  } else {
    const plan = PRICING_LIST.find((item) => item.id === plan_id);
    const hasError = !plan;

    if (hasError) {
      const [result] = await updateOrder(order.id, {
        status: "completed",
        is_error: true,
        error_msg: "Unvalid Subscription Plan",
      });

      return result;
    } else {
      const expiredAt = dayjs()
        .add(1, orderDetail.type === "yearly" ? "year" : "month")
        .endOf("day")
        .toDate();
      const subscription = checkout.subscription as Subscription;
      const [sub] = await insertSubscription({
        user_id: order.user_id,
        plan_type: plan.id,
        status: "active",
        interval: orderDetail.type === "yearly" ? "year" : "month",
        interval_count: 1,
        platform_sub_id: subscription.id,
        start_at: dayjs().startOf("day").toDate(),
        expired_at: expiredAt,
        last_payment_at: new Date(),
      });

      const planCredits = getPlanCreditsByType(
        plan,
        orderDetail.type === "yearly" ? "yearly" : "monthly"
      );

      if (planCredits > 0) {
        await insertCreditRecord({
          user_id: order.user_id,
          credits: planCredits,
          remaining_credits: planCredits,
          trans_type: "subscription",
          source_type: "order",
          source_id: order.order_no,
          expired_at: expiredAt,
        });
      }

      const [result] = await updateOrder(order.id, {
        status: "completed",
        sub_id: subscription.id,
        subscription_id: sub.id,
      });

      return result;
    }
  }
};

export const handleOrderRefund = async (checkoutId: string) => {
  const creem = createCreem();
  const checkout = await creem.getCheckout(checkoutId);
  if (!checkout || checkout.status !== "completed") {
    throw Error("Invalid checkout");
  }

  const order = await getOrderBySessionId(checkout.id);

  if (!order) throw Error("Invalid transaction");
  if (order.status !== "completed") {
    throw Error(`Transaction is ${order.status}`);
  }

  if (order.subscription_id) {
    const subscription = await getSubscriptionById(order.subscription_id);
    if (subscription) {
      await updateSubscription(subscription.id, {
        status: "cancelled",
        expired_at: new Date(),
        cancel_at: new Date(),
      });
    }
  }

  const credit = await getCreditRecordBySourceId(order.order_no);
  if (credit && credit.remaining_credits > 0) {
    await updateCreditRecord(credit.id, { remaining_credits: 0 });
    await insertCreditConsumption({
      user_id: credit.user_id,
      credits: credit.remaining_credits,
      credit_record_id: credit.id,
      reason: "Order Refund",
    });
  }

  const [result] = await updateOrder(order.id, {
    status: "refunded",
  });

  return result;
};

/**
 * 澶勭悊璁㈤槄鍙栨秷浜嬩欢锛堢敤鎴蜂富鍔ㄥ彇娑堟垨骞冲彴鍙栨秷锛?
 * 灏嗚闃呯姸鎬佹洿鏂颁负 cancelled锛屽搴旂Н鍒嗚褰曡涓哄嵆鏃惰繃鏈?
 */
export const handleSubscriptionCanceled = async (subscriptionId: string) => {
  const subscription = await getSubscriptionByPlatformId(subscriptionId);
  if (!subscription) {
    throw Error("Subscription not found");
  }

  // 鏇存柊璁㈤槄鐘舵€佷负 cancelled
  await updateSubscription(subscription.id, {
    status: "cancelled",
    cancel_at: new Date(),
  });

  return subscription;
};

/**
 * 澶勭悊璁㈤槄杩囨湡浜嬩欢锛堝埌鏈熸湭缁垂锛?
 * 灏嗚闃呯姸鎬佹洿鏂颁负 expired锛屾竻闆跺搴旂殑鍓╀綑绉垎
 */
export const handleSubscriptionExpired = async (subscriptionId: string) => {
  const subscription = await getSubscriptionByPlatformId(subscriptionId);
  if (!subscription) {
    throw Error("Subscription not found");
  }

  // 鏇存柊璁㈤槄鐘舵€佷负 expired
  await updateSubscription(subscription.id, {
    status: "expired",
    expired_at: new Date(),
  });

  return subscription;
};

/**
 * 澶勭悊璁㈤槄缁垂浜嬩欢锛堣嚜鍔ㄦ墸璐规垚鍔燂級
 * 寤堕暱璁㈤槄鍒版湡鏃堕棿锛屽苟琛ュ厖瀵瑰簲绉垎
 */
export const handleSubscriptionRenewal = async (subscriptionId: string) => {
  const subscription = await getSubscriptionByPlatformId(subscriptionId);
  if (!subscription) {
    throw Error("Subscription not found");
  }

  const plan = PRICING_LIST.find((item) => item.id === subscription.plan_type);
  if (!plan) {
    throw Error("Invalid subscription plan");
  }

  // 璁＄畻鏂扮殑鍒版湡鏃堕棿
  const newExpiredAt = dayjs()
    .add(1, subscription.interval === "year" ? "year" : "month")
    .endOf("day")
    .toDate();

  // 鏇存柊璁㈤槄璁板綍
  await updateSubscription(subscription.id, {
    status: "active",
    expired_at: newExpiredAt,
    last_payment_at: new Date(),
  });

  // 琛ュ厖绉垎
  const renewalCredits = getPlanCreditsByType(
    plan,
    subscription.interval === "year" ? "yearly" : "monthly"
  );

  if (renewalCredits > 0) {
    await insertCreditRecord({
      user_id: subscription.user_id,
      credits: renewalCredits,
      remaining_credits: renewalCredits,
      trans_type: "subscription",
      source_type: "subscription_renewal",
      source_id: subscriptionId,
      expired_at: newExpiredAt,
    });
  }

  return subscription;
};

