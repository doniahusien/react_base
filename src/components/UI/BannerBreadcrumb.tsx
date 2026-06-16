import type { ComponentType, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { LucideProps } from "lucide-react";

export interface BreadcrumbSegment {
  label: ReactNode;
  href?: string;
  icon?: ComponentType<LucideProps>;
}

interface BannerBreadcrumbProps { items: BreadcrumbSegment[]; }

export function BannerBreadcrumb({ items }: BannerBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-widest">
      {items.map((seg, i) => {
        const Icon = seg.icon;
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="inline-flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={11} className="text-purple-500/40 rtl:rotate-180 shrink-0" />}
            {isLast ? (
              <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-300/80 max-w-[180px] truncate">
                {Icon && <Icon size={12} className="shrink-0 opacity-70" />}
                <span className="truncate">{seg.label}</span>
              </span>
            ) : (
              <a href={seg.href ?? "#"} className="inline-flex items-center gap-1 text-purple-500/50 dark:text-purple-400/50 hover:text-purple-500 dark:hover:text-purple-300 transition-colors max-w-[140px] truncate">
                {Icon && <Icon size={12} className="shrink-0" />}
                <span className="truncate uppercase">{seg.label}</span>
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
