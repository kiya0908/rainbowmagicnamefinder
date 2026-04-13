import { redirect, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import type { Order } from "~/.server/libs/db";
import { shouldRequireBaseAuth } from "~/.server/libs/base-auth";
import { getOrdersByUserId } from "~/.server/model/order";
import { getSessionHandler } from "~/.server/libs/session";
import { createSeoDescriptors } from "~/utils/meta";
import {
  EmptyState,
  PageIntro,
  StatTile,
  formatCurrencyFromCents,
  formatDate,
  formatDateTime,
  formatInteger,
} from "./components/workspace";

const orderStatusClassMap: Record<Order["status"], string> = {
  pending: "badge-warning",
  paid: "badge-info",
  processing: "badge-primary",
  completed: "badge-success",
  refunding: "badge-warning",
  refunded: "badge-neutral",
  cancelled: "badge-ghost",
  expired: "badge-ghost",
};

export const meta: MetaFunction = ({ matches }) => {
  const rootData = matches[0]?.data as { DOMAIN?: string } | undefined;
  const title = "Orders | Rainbow Magic Fairy Name Finder Account";
  const description =
    "Review your Rainbow Magic Fairy Name Finder purchase orders, payment status, and billing timestamps.";

  return [
    { title },
    { name: "description", content: description },
    ...createSeoDescriptors({
      pathname: "/base/orders",
      domain: rootData?.DOMAIN,
      title,
      description,
      robots: "noindex, nofollow",
    }),
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const [session] = await getSessionHandler(request);
  const user = session.get("user") ?? null;
  const requireAuth = shouldRequireBaseAuth(context);
  if (!user && requireAuth) throw redirect("/?login=true");

  if (!user) return { orders: [] as Order[] };

  const orders = await getOrdersByUserId(user.id);
  return { orders };
};

export default function Orders() {
  const { orders } = useLoaderData<typeof loader>();

  const paidOrders = orders.filter(
    (order) => order.status === "paid" || order.status === "completed"
  );
  const totalPaidCents = paidOrders.reduce(
    (sum, order) => sum + Math.max(0, order.amount),
    0
  );

  return (
    <div className="space-y-6">
      <PageIntro
        title="Orders"
        description="Review purchases, payment status, and order references for support."
        action={{ label: "View pricing", to: "/#pricing" }}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Total Orders"
          value={formatInteger(orders.length)}
          helper="All recorded checkout attempts"
        />
        <StatTile
          label="Paid or Completed"
          value={formatInteger(paidOrders.length)}
          helper="Successful payments"
          tone="success"
        />
        <StatTile
          label="Total Spend"
          value={formatCurrencyFromCents(totalPaidCents)}
          helper="Sum of paid/completed orders"
        />
      </div>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Order History</h2>
          <span className="text-xs text-base-content/60">{orders.length} entries</span>
        </div>

        {orders.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Created</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs">{order.order_no}</td>
                    <td>
                      <div className="text-sm font-medium">{order.product_name}</div>
                      <div className="text-xs text-base-content/65">{order.product_id}</div>
                    </td>
                    <td className="text-sm">{formatDate(order.created_at)}</td>
                    <td className="text-sm font-medium">{formatCurrencyFromCents(order.amount)}</td>
                    <td>
                      <span
                        className={`badge badge-sm ${
                          orderStatusClassMap[order.status] ?? "badge-ghost"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="text-sm">{formatDateTime(order.paid_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No orders yet"
              description="After you purchase credits or a plan, your order records will appear here."
              action={{ label: "Browse pricing", to: "/#pricing" }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
