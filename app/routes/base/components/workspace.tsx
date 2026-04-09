import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { Link } from "~/components/common";

interface PageAction {
  label: string;
  to: string;
  target?: React.HTMLAttributeAnchorTarget;
}

interface PageIntroProps {
  title: string;
  description: string;
  action?: PageAction;
}

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  helper?: string;
  tone?: "default" | "primary" | "success" | "warning";
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: PageAction;
}

const toneClassMap: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "bg-base-100 border-base-300",
  primary: "bg-primary/5 border-primary/30",
  success: "bg-success/10 border-success/30",
  warning: "bg-warning/10 border-warning/30",
};

export const PageIntro = ({ title, description, action }: PageIntroProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-base-content/70 max-w-2xl">{description}</p>
      </div>
      {action && (
        <Link className="btn btn-sm btn-outline" to={action.to} target={action.target}>
          {action.label}
          <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
};

export const StatTile = ({
  label,
  value,
  helper,
  tone = "default",
}: StatTileProps) => {
  return (
    <div
      className={clsx(
        "rounded-xl border px-4 py-4 transition-colors",
        toneClassMap[tone]
      )}
    >
      <div className="text-xs uppercase tracking-wide text-base-content/60">{label}</div>
      <div className="mt-2 text-2xl font-semibold leading-none">{value}</div>
      {helper && <p className="mt-2 text-xs text-base-content/65">{helper}</p>}
    </div>
  );
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="rounded-xl border border-dashed border-base-300 bg-base-200/35 p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-base-content/70">{description}</p>
      {action && (
        <Link className="btn btn-sm btn-primary mt-5" to={action.to} target={action.target}>
          {action.label}
          <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
};

const toDate = (value: Date | number | null | undefined) => {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.valueOf()) ? null : value;
  }

  const normalized = value > 10_000_000_000 ? value : value * 1000;
  const date = new Date(normalized);
  return Number.isNaN(date.valueOf()) ? null : date;
};

export const formatDate = (value: Date | number | null | undefined) => {
  const date = toDate(value);
  if (!date) return "--";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatDateTime = (value: Date | number | null | undefined) => {
  const date = toDate(value);
  if (!date) return "--";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatCurrencyFromCents = (value: number | null | undefined) => {
  const cents = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

export const formatInteger = (value: number | null | undefined) => {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(safeValue);
};
