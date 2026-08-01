import { Link } from "~/components/common";

interface FairyBreadcrumbProps {
  current: string;
}

export function FairyBreadcrumb({ current }: FairyBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-xs font-bold text-on-surface-variant"
    >
      <Link to="/" className="transition hover:text-primary">
        Home
      </Link>
      <span aria-hidden>/</span>
      <span aria-current="page">{current}</span>
    </nav>
  );
}
