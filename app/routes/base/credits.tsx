import { redirect } from "react-router";
import type { Route } from "./+types/credits";
import type { Credit } from "~/.server/libs/db";
import { shouldRequireBaseAuth } from "~/.server/libs/base-auth";
import { listCreditRecordsByUser } from "~/.server/model/credit_record";
import { getSessionHandler } from "~/.server/libs/session";
import { getUserCredits } from "~/.server/services/credits";
import { createSeoDescriptors } from "~/utils/meta";
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
  const title = "Credits | Rainbow Magic Fairy Name Finder Account";
  const description =
    "Check your Rainbow Magic Fairy Name Finder credit balance and credit record history.";

  return [
    { title },
    { name: "description", content: description },
    ...createSeoDescriptors({
      pathname: "/base/credits",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      robots: "noindex, nofollow",
    }),
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
        description="Track available credits and every credit record tied to your account."
        action={{ label: "Back to Home", to: "/" }}
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
              description="When credits are granted or adjusted, the records will show up here."
              action={{ label: "Back to Home", to: "/" }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
