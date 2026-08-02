import type { ReactNode } from "react";

interface SectionCardProps {
  icon: (props: { size?: number; className?: string }) => ReactNode;
  title: string;
  subtitle?: string;
  color?: "primary" | "emerald" | "blue" | "orange" | "rose" | "sky";
  step?: number;
  children: ReactNode;
}

/**
 * Color variants for non-primary accent colors only.
 * "primary" uses CSS vars so it adapts automatically to theme changes.
 */
const colorMap = {
  primary: {
    ring:  "ring-primary/20",
    bg:    "bg-primary/5",
    icon:  "text-primary",
    dot:   "bg-primary",
    badge: "bg-primary/10 text-primary",
  },
  emerald: {
    ring:  "ring-emerald/40",
    bg:    "bg-emerald-soft",
    icon:  "text-emerald",
    dot:   "bg-emerald",
    badge: "bg-emerald-soft text-emerald",
  },
  blue: {
    ring:  "ring-blue/40",
    bg:    "bg-blue-soft",
    icon:  "text-blue",
    dot:   "bg-blue",
    badge: "bg-blue-soft text-blue",
  },
  orange: {
    ring:  "ring-amber/40",
    bg:    "bg-amber-soft",
    icon:  "text-amber",
    dot:   "bg-amber",
    badge: "bg-amber-soft text-amber",
  },
  rose: {
    ring:  "ring-destructive/40",
    bg:    "bg-destructive/10",
    icon:  "text-destructive",
    dot:   "bg-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
  sky: {
    ring:  "ring-blue/40",
    bg:    "bg-blue-soft",
    icon:  "text-blue",
    dot:   "bg-blue",
    badge: "bg-blue-soft text-blue",
  },
};

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  color = "primary",
  step,
  children,
}: SectionCardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm">
      <div
        className={`flex items-center gap-4 border-b border-border px-5 py-4 rounded-t-2xl ${c.bg}`}
      >
        {step !== undefined && (
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${c.badge}`}
          >
            {step}
          </span>
        )}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 bg-card ${c.ring}`}
        >
          <Icon size={16} className={c.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight text-foreground">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <div className="hidden sm:flex items-center gap-1 opacity-30">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${c.dot}`}
              style={{ opacity: 1 - i * 0.25 }}
            />
          ))}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
