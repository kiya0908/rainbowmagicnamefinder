interface FairyPageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  visual: React.ReactNode;
  breadcrumb?: React.ReactNode;
  children?: React.ReactNode;
}

export function FairyPageHero({
  eyebrow,
  title,
  description,
  visual,
  breadcrumb,
  children,
}: FairyPageHeroProps) {
  return (
    <section className="overflow-hidden border-b border-outline-variant bg-surface px-5 py-14 md:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        {breadcrumb ? <div className="mb-8">{breadcrumb}</div> : null}

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.72fr)] lg:items-center lg:gap-16">
          <div className="min-w-0 text-center lg:text-left">
            <p className="inline-flex min-h-4 items-center font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mx-auto mt-5 max-w-[15ch] font-serif text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-on-surface md:text-6xl lg:mx-0 lg:text-7xl">
              {title}
            </h1>
            <div className="mx-auto mt-6 max-w-2xl text-base leading-8 text-on-surface-variant md:text-lg lg:mx-0">
              {description}
            </div>
            {children ? <div className="mt-8">{children}</div> : null}
          </div>

          <div className="min-w-0">{visual}</div>
        </div>
      </div>
    </section>
  );
}
