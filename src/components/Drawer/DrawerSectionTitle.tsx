import type { ReactNode } from "react";

interface DrawerSectionTitleProps {
  children: ReactNode;
  /** Larger title used in two-column panel header */
  size?: "sm" | "lg";
  className?: string;
}

export function DrawerSectionTitle({
  children,
  size = "sm",
  className = "",
}: DrawerSectionTitleProps) {
  return (
    <div
      className={`drawer-section-title group/title ${
        size === "lg" ? "drawer-section-title--lg" : ""
      } ${className}`}
    >
      <span className="drawer-section-title__mark" aria-hidden>
        <span className="drawer-section-title__dot" />
      </span>
      <p className="drawer-section-title__label">{children}</p>
      <span className="drawer-section-title__line" aria-hidden />
    </div>
  );
}
