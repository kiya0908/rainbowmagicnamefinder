//导航站徽章显示配置组件
export type DirectoryBadgeMode = "badge" | "link" | "badge+link";

export interface DirectoryBadgeItem {
  id: string;
  name: string;
  href: string;
  mode?: DirectoryBadgeMode;
  badgeSrc?: string;
  badgeAlt?: string;
  badgeWidth?: number;
  badgeHeight?: number;
  linkLabel?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  active?: boolean;
  note?: string;
}

export interface DirectoryBadgesProps {
  items?: DirectoryBadgeItem[];
  title?: string;
  className?: string;
}

export const DirectoryBadges = ({
  items = [],
  title = "Featured on directories",
  className,
}: DirectoryBadgesProps) => {
  const activeItems = items.filter((item) => item.active !== false);

  if (!activeItems.length) {
    return null;
  }

  const sectionClass = [
    "max-w-7xl mx-auto mt-14 pt-10 border-t border-outline-variant/70",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass} aria-label="Directory badges and links">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
        {title}
      </p>

      <ul className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:thin] md:flex-wrap md:overflow-visible md:snap-none">
        {activeItems.map((item) => {
          const mode = item.mode ?? (item.badgeSrc ? "badge+link" : "link");
          const showBadge = mode === "badge" || mode === "badge+link";
          const showLinkLabel = mode === "link" || mode === "badge+link";
          const target = item.target ?? "_blank";

          return (
            <li key={item.id} className="snap-start shrink-0">
              <a
                href={item.href}
                target={target}
                rel={
                  target === "_blank"
                    ? item.rel ?? "noopener noreferrer"
                    : item.rel
                }
                className="group inline-flex min-h-12 min-w-[11rem] flex-col items-center justify-center gap-1 rounded-xl border border-outline-variant/80 bg-white px-3 py-2 text-center transition-colors hover:border-primary/25 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {showBadge && item.badgeSrc ? (
                  <img
                    src={item.badgeSrc}
                    alt={item.badgeAlt ?? `${item.name} badge`}
                    width={item.badgeWidth ?? 120}
                    height={item.badgeHeight ?? 40}
                    loading="lazy"
                    decoding="async"
                    className="h-auto max-h-10 w-auto"
                  />
                ) : null}

                {showLinkLabel ? (
                  <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary">
                    {item.linkLabel ?? item.name}
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
