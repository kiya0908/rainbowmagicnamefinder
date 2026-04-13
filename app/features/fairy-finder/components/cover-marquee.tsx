import { FAIRY_LIST } from "../data/fairies";

const COVER_ITEMS = FAIRY_LIST.slice(0, 14);
const LOOPED_COVERS = [...COVER_ITEMS, ...COVER_ITEMS];

export const CoverMarquee = () => {
  return (
    <div className="rounded-3xl border border-outline-variant bg-white/75 p-4 shadow-sm backdrop-blur-sm md:p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
          Official Cover Preview
        </p>
        <span className="rounded-full bg-secondary-fixed px-3 py-1 text-xs font-semibold text-on-surface-variant">
          {COVER_ITEMS.length}+ titles
        </span>
      </div>

      <div className="fairy-cover-marquee mt-4">
        <div className="fairy-cover-track">
          {LOOPED_COVERS.map((fairy, index) => (
            <article
              key={`${fairy.id}-${index}`}
              className="w-32 shrink-0 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-2 shadow-sm"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-surface-container-low">
                <img
                  src={fairy.imageUrl}
                  alt={fairy.fullTitle}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 h-10 overflow-hidden text-[11px] leading-5 text-on-surface-variant">
                {fairy.fullTitle}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

