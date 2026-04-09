import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_STATE = {
  lastCheckAt: null,
  lastTransactionId: null,
  transactionCount: 0,
  customerCount: 0,
  subscriptions: {
    active: 0,
    trialing: 0,
    past_due: 0,
    paused: 0,
    canceled: 0,
    expired: 0,
    scheduled_cancel: 0,
  },
  knownSubscriptions: {},
};

const SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "paused",
  "canceled",
  "expired",
  "scheduled_cancel",
];

const cwd = process.cwd();
const devVarsPath = path.join(cwd, ".dev.vars");

const stripQuotes = (value) => value.replace(/^['"]|['"]$/g, "");

const parseDevVars = async () => {
  try {
    const raw = await readFile(devVarsPath, "utf8");
    return raw.split(/\r?\n/).reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;

      const separator = trimmed.indexOf("=");
      if (separator === -1) return acc;

      const key = trimmed.slice(0, separator).trim();
      const value = stripQuotes(trimmed.slice(separator + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const normalizeArrayPayload = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const loadState = async (statePath) => {
  try {
    const raw = await readFile(statePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
};

const saveState = async (statePath, state) => {
  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
};

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format((Number(amount) || 0) / 100);

const main = async () => {
  const fileEnv = await parseDevVars();
  const mergedEnv = { ...fileEnv, ...process.env };
  const apiKey = mergedEnv.CREEM_KEY || mergedEnv.CREEM_TEST_KEY;
  const storeId = mergedEnv.CREEM_STORE_ID || "default";

  if (!apiKey) {
    throw new Error("Missing CREEM_KEY or CREEM_TEST_KEY in environment.");
  }

  const apiBase = apiKey.startsWith("creem_test_")
    ? "https://test-api.creem.io"
    : "https://api.creem.io";
  const statePath = path.join(
    cwd,
    ".temp",
    `creem-heartbeat-state-${storeId}.json`
  );

  const previousState = await loadState(statePath);
  const firstRun = previousState.lastCheckAt === null;

  const fetchJson = async (pathname) => {
    const response = await fetch(`${apiBase}${pathname}`, {
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Creem API ${response.status}: ${body}`);
    }

    return response.json();
  };

  const transactions = normalizeArrayPayload(
    await fetchJson("/v1/transactions/search?limit=20")
  );
  const customers = normalizeArrayPayload(await fetchJson("/v1/customers/list"));

  const subscriptionEntries = await Promise.all(
    SUBSCRIPTION_STATUSES.map(async (status) => {
      const items = normalizeArrayPayload(
        await fetchJson(`/v1/subscriptions/search?status=${status}`)
      );
      return [status, items];
    })
  );

  const subscriptionsByStatus = Object.fromEntries(subscriptionEntries);
  const nextKnownSubscriptions = {};
  for (const [status, items] of subscriptionEntries) {
    for (const item of items) {
      if (item?.id) {
        nextKnownSubscriptions[item.id] = status;
      }
    }
  }

  const nextState = {
    lastCheckAt: new Date().toISOString(),
    lastTransactionId: transactions[0]?.id ?? previousState.lastTransactionId,
    transactionCount: transactions.length,
    customerCount: customers.length,
    subscriptions: Object.fromEntries(
      SUBSCRIPTION_STATUSES.map((status) => [
        status,
        subscriptionsByStatus[status]?.length ?? 0,
      ])
    ),
    knownSubscriptions: nextKnownSubscriptions,
  };

  const messages = [];

  if (firstRun) {
    messages.push("Creem heartbeat initialized.");
    messages.push(`- Store: ${storeId}`);
    messages.push(`- Customers: ${nextState.customerCount}`);
    messages.push(`- Recent transactions loaded: ${nextState.transactionCount}`);
    messages.push(
      `- Active subscriptions: ${nextState.subscriptions.active}`
    );
    if (nextState.subscriptions.past_due > 0) {
      messages.push(
        `- Past due subscriptions: ${nextState.subscriptions.past_due}`
      );
    }
  } else {
    const previousTransactionId = previousState.lastTransactionId;
    const newTransactions = previousTransactionId
      ? transactions.filter((item) => item?.id && item.id !== previousTransactionId)
      : transactions.slice(0, 1);

    if (newTransactions.length > 0) {
      messages.push(
        `New transactions: ${newTransactions.length}`
      );
      for (const txn of newTransactions.reverse()) {
        const productName =
          txn?.product?.name || txn?.product_name || txn?.product || "Unknown";
        const customerEmail =
          txn?.customer?.email || txn?.customer_email || "unknown";
        messages.push(
          `- ${productName} / ${formatMoney(txn?.amount, txn?.currency || "USD")} / ${customerEmail}`
        );
      }
    }

    if (nextState.customerCount > previousState.customerCount) {
      messages.push(
        `New customers: +${nextState.customerCount - previousState.customerCount}`
      );
    }

    for (const [subscriptionId, status] of Object.entries(nextKnownSubscriptions)) {
      const previousStatus = previousState.knownSubscriptions?.[subscriptionId];
      if (previousStatus && previousStatus !== status) {
        messages.push(
          `Subscription ${subscriptionId} changed: ${previousStatus} -> ${status}`
        );
      }
    }

    for (const status of SUBSCRIPTION_STATUSES) {
      const previousCount = previousState.subscriptions?.[status] ?? 0;
      const nextCount = nextState.subscriptions[status] ?? 0;
      if (nextCount > previousCount && ["past_due", "expired", "scheduled_cancel", "canceled"].includes(status)) {
        messages.push(`Subscription status increased: ${status} (+${nextCount - previousCount})`);
      }
    }

    if (messages.length === 0) {
      messages.push("No Creem changes detected.");
    }
  }

  await saveState(statePath, nextState);

  for (const message of messages) {
    console.log(message);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
