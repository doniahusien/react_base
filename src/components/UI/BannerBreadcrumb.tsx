import type { ComponentType, ReactNode, SVGProps } from "react";
import { ChevronRightIcon as ChevronRight, HomeIcon } from "@heroicons/react/24/outline";

export type HeroIconProps = SVGProps<SVGSVGElement> & { size?: number | string };

export interface BreadcrumbSegment {
  label: ReactNode;
  href?: string;
  icon?: ComponentType<HeroIconProps>;
}

interface BannerBreadcrumbProps { 
  items: BreadcrumbSegment[];
  showHome?: boolean;
  homeHref?: string;
  separator?: "chevron" | "slash" | "dot";
  variant?: "pill" | "minimal" | "underline" | "arrow";
}

export function BannerBreadcrumb({ 
  items, 
  showHome = false,
  homeHref = "/",
  separator = "chevron",
  variant = "pill"
}: BannerBreadcrumbProps) {
  const allItems = showHome 
    ? [{ label: "Home", href: homeHref, icon: HomeIcon }, ...items]
    : items;

  const renderSeparator = () => {
    if (variant === "arrow") return null; // Arrow variant doesn't use separators
    
    const baseClass = "text-foreground-50 shrink-0 mx-1 dark:text-foreground-30";
    
    switch (separator) {
      case "slash":
        return <span className={`${baseClass} text-base font-light`}>/</span>;
      case "dot":
        return <span className={`${baseClass} text-xl leading-none pb-1`}>·</span>;
      case "chevron":
      default:
        return (
          <ChevronRight 
            width={16} 
            height={16} 
            className={`${baseClass} rtl:rotate-180`}
          />
        );
    }
  };

  // Pill variant (current style)
  if (variant === "pill") {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1">
        {allItems.map((seg, i) => {
          const Icon = seg.icon;
          const isLast = i === allItems.length - 1;
          const isHome = showHome && i === 0;
          
          return (
            <span key={i} className="inline-flex items-center gap-1 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}>
              {i > 0 && renderSeparator()}
              {isLast ? (
              <span className="inline-flex items-center gap-2 text-foreground font-semibold text-sm max-w-[240px] truncate">
                  {Icon && <Icon width={16} height={16} className="shrink-0" />}
                  <span className="truncate">{seg.label}</span>
                </span>
              ) : (
                <a 
                  href={seg.href ?? "#"} 
                  className="inline-flex items-center gap-2 text-foreground-70 hover:text-foreground transition-colors duration-200 text-sm max-w-[200px] truncate group"
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && (
                    <Icon 
                      width={isHome ? 16 : 16} 
                      height={isHome ? 16 : 16} 
                      className="shrink-0 opacity-70 group-hover:opacity-100 transition-all group-hover:scale-110" 
                    />
                  )}
                  <span className="truncate">{seg.label}</span>
                </a>
              )}
            </span>
          );
        })}
      </nav>
    );
  }

  // Minimal variant - flat design with underline hover
  if (variant === "minimal") {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-0.5">
        {allItems.map((seg, i) => {
          const Icon = seg.icon;
          const isLast = i === allItems.length - 1;
          
          return (
            <span key={i} className="inline-flex items-center gap-0.5 animate-in fade-in" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}>
              {i > 0 && renderSeparator()}
              {isLast ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 text-primary font-semibold text-sm max-w-[240px] truncate">
                  {Icon && <Icon width={14} height={14} className="shrink-0" />}
                  <span className="truncate">{seg.label}</span>
                </span>
              ) : (
                <a 
                  href={seg.href ?? "#"} 
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors text-sm max-w-[200px] truncate group relative"
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && <Icon width={14} height={14} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />}
                  <span className="truncate relative">
                    {seg.label}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full" />
                  </span>
                </a>
              )}
            </span>
          );
        })}
      </nav>
    );
  }

  // Underline variant - sleek with bottom border
  if (variant === "underline") {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 border-b border-border/50 pb-2">
        {allItems.map((seg, i) => {
          const Icon = seg.icon;
          const isLast = i === allItems.length - 1;
          
          return (
            <span key={i} className="inline-flex items-center gap-1 animate-in fade-in slide-in-from-top-1" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}>
              {i > 0 && renderSeparator()}
              {isLast ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-foreground font-bold text-sm max-w-[240px] truncate border-b-2 border-primary">
                  {Icon && <Icon width={16} height={16} className="shrink-0 text-primary" />}
                  <span className="truncate">{seg.label}</span>
                </span>
              ) : (
                <a 
                  href={seg.href ?? "#"} 
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 text-sm max-w-[200px] truncate group border-b-2 border-transparent hover:border-muted-foreground/30"
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && <Icon width={16} height={16} className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />}
                  <span className="truncate">{seg.label}</span>
                </a>
              )}
            </span>
          );
        })}
      </nav>
    );
  }

  // Arrow variant - connected arrow shapes
  if (variant === "arrow") {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-0">
        {allItems.map((seg, i) => {
          const Icon = seg.icon;
          const isLast = i === allItems.length - 1;
          const isFirst = i === 0;
          
          return (
            <span 
              key={i} 
              className="inline-flex items-center animate-in fade-in slide-in-from-left-3" 
              style={{ 
                animationDelay: `${i * 50}ms`, 
                animationFillMode: 'backwards',
                marginLeft: isFirst ? '0' : '-8px'
              }}
            >
              {isLast ? (
                <span 
                  className="inline-flex items-center gap-2 px-4 py-1.5 pr-5 text-primary-foreground bg-primary font-semibold text-sm max-w-[240px] truncate relative"
                  style={{
                    clipPath: isFirst 
                      ? 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)'
                      : 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)'
                  }}
                >
                  {Icon && <Icon width={16} height={16} className="shrink-0" />}
                  <span className="truncate">{seg.label}</span>
                </span>
              ) : (
                <a 
                  href={seg.href ?? "#"} 
                  className="inline-flex items-center gap-2 px-4 py-1.5 pr-5 text-muted-foreground hover:text-foreground bg-card hover:bg-muted transition-all duration-200 text-sm max-w-[200px] truncate group relative border border-border/50 hover:border-border"
                  style={{
                    clipPath: isFirst 
                      ? 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)'
                      : 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)'
                  }}
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && <Icon width={16} height={16} className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />}
                  <span className="truncate">{seg.label}</span>
                </a>
              )}
            </span>
          );
        })}
      </nav>
    );
  }

  return null;
}
