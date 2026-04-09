import { redirect } from "react-router";
import type { Route } from "./+types/subscription";
import type { Subscription } from "~/.server/libs/db";
import { shouldRequireBaseAuth } from "~/.server/libs/base-auth";
import { getSessionHandler } from "~/.server/libs/session";
import { getSubscriptionsByUserId } from "~/.server/model/subscriptions";
import { createCanonical } from "~/utils/meta";
import {
  EmptyState,
  PageIntro,
  StatTile,
  formatDate,
  formatInteger,
} from "./components/workspace";

const subscriptionStatusClassMap: Record<Subscription["status"], string> = {
  active: "badge-success",
  cancelled: "badge-warning",
  expired: "badge-ghost",
};

export const meta: Route.MetaFunction = ({ matches }) => {
  const domain = matches[0]?.data?.DOMAIN ?? "https://linkedinspeaktranslator.top";

  return [
    { title: "Subscription | LinkedIn Translator Account" },
    {
      name: "description",
      content:
        "Manage your LinkedIn Translator plan details, renewal timeline, and subscription history.",
    },
    { name: "robots", content: "noindex, nofollow" },
    createCanonical("/base/subscription", domain),
  ];
};

const toPlanLabel = (value: string | null | undefined) => {
  if (!value) return "Free";
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const toIntervalLabel = (interval: Subscription["interval"], count: number | null) => {
  if (!interval) return "--";
  const safeCount = count && count > 0 ? count : 1;
  return safeCount === 1 ? `Every ${interval}` : `Every ${safeCount} ${interval}s`;
};

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const [session] = await getSessionHandler(request);
  const user = session.get("user") ?? null;
  const requireAuth = shouldRequireBaseAuth(context);
  if (!user && requireAuth) throw redirect("/?login=true");

  if (!user) {
    return {
      current: null as Subscription | null,
      history: [] as Subscription[],
    };
  }

  let subscriptions: Subscription[] = [];
  try {
    subscriptions = await getSubscriptionsByUserId(user.id);
  } catch {
    subscriptions = [];
  }

  const active = subscriptions.find((subscription) => subscription.status === "active") ?? null;
  const latest = subscriptions[0] ?? null;
  const current = active ?? latest;

  return {
    current,
    history: subscriptions,
  };
};

export default function SubscriptionPage({ loaderData }: Route.ComponentProps) {
  const { current, history } = loaderData;

  const isActive = current?.status === "active";
  const planLabel = toPlanLabel(current?.plan_type);
  const statusLabel = current?.status ?? "free";
  const nextRenewal = isActive ? formatDate(current?.expired_at) : "--";

  return (
    <div className="space-y-6">
      <PageIntro
        title="Subscription"
        description="Track your plan lifecycle, renewal timing, and past subscription entries."
        action={
          isActive
            ? {
                label: "Billing support",
                to: "mailto:support@linkedinspeaktranslator.top",
                target: "_blank",
              }
            : { label: "Upgrade plan", to: "/#pricing" }
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Current Plan"
          value={planLabel}
          helper="Derived from latest active subscription"
          tone={isActive ? "success" : "default"}
        />
        <StatTile
          label="Plan Status"
          value={statusLabel}
          helper={isActive ? "Plan is active" : "No active subscription"}
          tone={isActive ? "success" : "warning"}
        />
        <StatTile
          label="Next Renewal"
          value={nextRenewal}
          helper="Expected billing renewal date"
        />
      </div>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-5 md:p-6">
        <h2 className="text-lg font-semibold">Current Subscription</h2>

        {current ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-base-300 p-4">
              <div className="text-xs uppercase tracking-wide text-base-content/60">Plan Type</div>
              <div className="mt-2 text-base font-medium">{planLabel}</div>
            </div>

            <div className="rounded-xl border border-base-300 p-4">
              <div className="text-xs uppercase tracking-wide text-base-content/60">Billing Interval</div>
              <div className="mt-2 text-base font-medium">
                {toIntervalLabel(current.interval, current.interval_count)}
              </div>
            </div>

            <div className="rounded-xl border border-base-300 p-4">
              <div className="text-xs uppercase tracking-wide text-base-content/60">Status</div>
              <div className="mt-2">
                <span
                  className={`badge badge-sm ${
                    current.status ? subscriptionStatusClassMap[current.status] : "badge-ghost"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-base-300 p-4">
              <div className="text-xs uppercase tracking-wide text-base-content/60">Renewal / End Date</div>
              <div className="mt-2 text-base font-medium">{formatDate(current.expired_at)}</div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No subscription found"
              description="You are currently on the free experience. Upgrade anytime to unlock higher limits and recurring credits."
              action={{ label: "Choose a plan", to: "/#pricing" }}
            />
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="rounded-2xl border border-base-300 bg-base-100 p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Subscription History</h2>
            <span className="text-xs text-base-content/60">{formatInteger(history.length)} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                </tr>
              </thead>
              <tbody>
                {history.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="text-sm font-medium">{toPlanLabel(subscription.plan_type)}</td>
                    <td>
                      <span
                        className={`badge badge-sm ${subscriptionStatusClassMap[subscription.status]}`}
                      >
                        {subscription.status}
                      </span>
                    </td>
                    <td className="text-sm">{formatDate(subscription.start_at)}</td>
                    <td className="text-sm">{formatDate(subscription.expired_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
