import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight } from "@heroicons/react/24/outline";
import type { PaginationProps } from "./types";

export function Pagination({ meta, page, onPage }: PaginationProps) {
  if (meta.last_page <= 1) return null;

  const all = Array.from({ length: meta.last_page }, (_, i) => i + 1);
  let pages: (number | "…")[] = all;

  if (all.length > 7) {
    const l = Math.max(1, page - 2);
    const r = Math.min(meta.last_page, page + 2);
    pages = [
      ...(l > 1 ? [1, ...(l > 2 ? (["…"] as const) : [])] : []),
      ...all.slice(l - 1, r),
      ...(r < meta.last_page
        ? [...(r < meta.last_page - 1 ? (["…"] as const) : []), meta.last_page]
        : []),
    ] as (number | "…")[];
  }

  const navBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:border-border disabled:hover:text-muted-foreground";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card border border-border px-5 py-4 shadow-sm">
      <p className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground">
          {meta.from ?? (page - 1) * meta.per_page + 1}
        </span>
        <span className="mx-1.5">–</span>
        <span className="font-bold text-foreground">
          {meta.to ?? Math.min(page * meta.per_page, meta.total)}
        </span>
        <span className="mx-1.5 opacity-60">of</span>
        <span className="font-bold text-foreground">{meta.total}</span>
      </p>
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className={navBtn}>
          <ArrowLeft width={16} height={16} />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`d${i}`} className="flex h-9 w-9 shrink-0 items-center justify-center text-sm text-muted-foreground">
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums transition-all ${
                page === p
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-background border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button onClick={() => onPage(page + 1)} disabled={page >= meta.last_page} className={navBtn}>
          <ArrowRight width={16} height={16} />
        </button>
      </div>
    </div>
  );
}
