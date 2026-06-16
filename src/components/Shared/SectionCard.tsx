import type { ReactNode } from "react";

interface SectionCardProps {
  icon: (props: { size?: number; className?: string }) => ReactNode;
  title: string; subtitle?: string;
  color?: "purple" | "emerald" | "blue" | "orange" | "rose" | "sky";
  step?: number; children: ReactNode;
}

const colorMap = {
  purple:  { ring: "ring-purple-200 dark:ring-purple-800/40",  bg: "bg-purple-50  dark:bg-purple-950/30",  icon: "text-purple-600",  dot: "bg-purple-500",  badge: "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400" },
  emerald: { ring: "ring-emerald-200 dark:ring-emerald-800/40", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "text-emerald-600", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
  blue:    { ring: "ring-blue-200 dark:ring-blue-800/40",    bg: "bg-blue-50   dark:bg-blue-950/30",    icon: "text-blue-600",    dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" },
  orange:  { ring: "ring-orange-200 dark:ring-orange-800/40", bg: "bg-orange-50 dark:bg-orange-950/30",  icon: "text-orange-600",  dot: "bg-orange-500",  badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400" },
  rose:    { ring: "ring-rose-200 dark:ring-rose-800/40",    bg: "bg-rose-50   dark:bg-rose-950/30",    icon: "text-rose-600",    dot: "bg-rose-500",    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" },
  sky:     { ring: "ring-sky-200 dark:ring-sky-800/40",      bg: "bg-sky-50    dark:bg-sky-950/30",     icon: "text-sky-600",     dot: "bg-sky-500",     badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400" },
};

export function SectionCard({ icon: Icon, title, subtitle, color = "purple", step, children }: SectionCardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-800/50 shadow-sm shadow-slate-200/60 dark:shadow-slate-950/20">
      <div className={`flex items-center gap-4 border-b border-slate-100 dark:border-slate-700/50 px-5 py-4 rounded-t-2xl overflow-hidden ${c.bg}`}>
        {step !== undefined && <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${c.badge}`}>{step}</span>}
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 bg-white dark:bg-slate-800 ${c.ring}`}><Icon size={16} className={c.icon} /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight text-text">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-app-muted truncate">{subtitle}</p>}
        </div>
        <div className="hidden sm:flex items-center gap-1 opacity-30">
          {[0, 1, 2].map((i) => <span key={i} className={`h-1.5 w-1.5 rounded-full ${c.dot}`} style={{ opacity: 1 - i * 0.25 }} />)}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
