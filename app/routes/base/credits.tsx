import { redirect } from "react-router";
import type { Route } from "./+types/credits";
import type { Credit } from "~/.server/libs/db";
import { shouldRequireBaseAuth } from "~/.server/libs/base-auth";
import { listCreditRecordsByUser } from "~/.server/model/credit_record";
import { getSessionHandler } from "~/.server/libs/session";
import { getUserCredits } from "~/.server/services/credits";
import { createCanonical } from "~/utils/meta";
import {
  EmptyState,
  PageIntro,
  StatTile,
  formatDate,
  formatInteger,
} from "./components/workspace";

const creditTypeLabelMap: Record<Credit["trans_type"], string> = {
  initilize: "Initial grant",
  purchase: "Purchase",
  subscription: "Subscription",
  adjustment: "Adjustment",
};

const creditTypeBadgeClassMap: Record<Credit["trans_type"], string> = {
  initilize: "badge-info",
  purchase: "badge-primary",
  subscription: "badge-success",
  adjustment: "badge-warning",
};

export const meta: Route.MetaFunction = ({ matches }) => {
  const domain = matches[0]?.data?.DOMAIN ?? "https://linkedinspeaktranslator.top";

  return [
    { title: "Credits | LinkedIn Translator Account" },
    {
      name: "description",
      content:
        "Check your LinkedIn Translator credit balance, top-up history, and remaining credit records.",
    },
    { name: "robots", content: "noindex, nofollow" },
    createCanonical("/base/credits", domain),
  ];
};

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const [session] = await getSessionHandler(request);
  const user = session.get("user") ?? null;
  const requireAuth = shouldRequireBaseAuth(context);
  if (!user && requireAuth) throw redirect("/?login=true");

  if (!user) {
    return {
      records: [] as Credit[],
      balance: 0,
    };
  }

  const [records, creditsSummary] = await Promise.all([
    listCreditRecordsByUser(user.id),
    getUserCredits(user),
  ]);

  return {
    records,
    balance: creditsSummary.balance,
  };
};

export default function Credits({ loaderData }: Route.ComponentProps) {
  const { records, balance } = loaderData;

  const totalGranted = records.reduce(
    (sum, record) => sum + Math.max(0, record.credits),
    0
  );
  const activeBuckets = records.filter((record) => record.remaining_credits > 0).length;

  return (
    <div className="space-y-6">
      <PageIntro
        title="Credits"
        description="Track available credits and every top-up record tied to your account."
        action={{ label: "Buy credits", to: "/#pricing" }}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Available Now"
          value={`${formatInteger(balance)} credits`}
          helper="Real-time remaining balance"
          tone="primary"
        />
        <StatTile
          label="Total Granted"
          value={`${formatInteger(totalGranted)} credits`}
          helper="All-time credited amount"
        />
        <StatTile
          label="Active Buckets"
          value={formatInteger(activeBuckets)}
          helper="Credit records with remaining balance"
        />
      </div>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Credit Records</h2>
          <span className="text-xs text-base-content/60">{records.length} entries</span>
        </div>

        {records.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Granted</th>
                  <th>Remaining</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record: Credit) => (
                  <tr key={record.id}>
                    <td className="text-sm">{formatDate(record.created_at)}</td>
                    <td>
                      <span className={`badge badge-sm ${creditTypeBadgeClassMap[record.trans_type]}`}>
                        {creditTypeLabelMap[record.trans_type]}
                      </span>
                    </td>
                    <td className="font-medium text-success">+{formatInteger(record.credits)}</td>
                    <td>{formatInteger(record.remaining_credits)}</td>
                    <td className="font-mono text-xs text-base-content/70">
                      {record.source_id || "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No credit records yet"
              description="When you receive starter credits or complete a purchase, the records will show up here."
              action={{ label: "Go to pricing", to: "/#pricing" }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
