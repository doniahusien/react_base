import type { ReactNode } from "react";

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function displayName(name: string | null | undefined): string {
  return name?.trim() || "—";
}

function statusStyles(status: string | null | undefined): {
  badge: string;
  dot: string;
} {
  switch (status) {
    case "active":
    case "approved":
    case "verified":
    case "success":
    case "available":
    case "published":
      return {
        badge:
          "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
        dot: "bg-emerald-500 shadow-[0_0_0_2px] shadow-emerald-500/20",
      };
    case "pending":
    case "pending_review":
    case "initiated":
    case "submitted":
      return {
        badge:
          "bg-amber-500/10 text-amber-800 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
        dot: "bg-amber-500 shadow-[0_0_0_2px] shadow-amber-500/20",
      };
    case "answered":
      return {
        badge:
          "bg-sky-500/10 text-sky-700 ring-1 ring-inset ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
        dot: "bg-sky-500 shadow-[0_0_0_2px] shadow-sky-500/20",
      };
    case "unread":
      return {
        badge:
          "bg-amber-500/10 text-amber-800 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
        dot: "bg-amber-500 shadow-[0_0_0_2px] shadow-amber-500/20",
      };
    case "read":
      return {
        badge:
          "bg-sky-500/10 text-sky-700 ring-1 ring-inset ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
        dot: "bg-sky-500 shadow-[0_0_0_2px] shadow-sky-500/20",
      };
    case "inactive":
    case "suspended":
    case "rejected":
    case "failed":
      return {
        badge:
          "bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25",
        dot: "bg-rose-500 shadow-[0_0_0_2px] shadow-rose-500/20",
      };
    case "refunded":
    case "used":
    case "closed":
      return {
        badge:
          "bg-sky-500/10 text-sky-700 ring-1 ring-inset ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
        dot: "bg-sky-500 shadow-[0_0_0_2px] shadow-sky-500/20",
      };
    case "open":
      return {
        badge:
          "bg-amber-500/10 text-amber-800 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
        dot: "bg-amber-500 shadow-[0_0_0_2px] shadow-amber-500/20",
      };
    default:
      return {
        badge:
          "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
        dot: "bg-muted-foreground/60",
      };
  }
}

export function statusTone(status: string | null | undefined): string {
  return statusStyles(status).badge;
}

export function StatusBadge({
  status,
  label,
}: {
  status: string | null | undefined;
  label?: ReactNode;
}) {
  if (!status) return <span className="text-sm text-muted-foreground">—</span>;
  const { badge, dot } = statusStyles(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide capitalize ${badge}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

export function InfoCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm font-semibold text-foreground">{children}</div>
    </div>
  );
}

export function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: any;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
        <Icon width={15} height={15} className="text-primary" />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
    </div>
  );
}

export function Avatar({ name }: { name?: string | null }) {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-primary/10 text-xs font-bold text-primary">
      {initials || "?"}
    </span>
  );
}
