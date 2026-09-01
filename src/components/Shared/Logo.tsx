import type { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  /**
   * - `default`: primary background + main accent strokes
   * - `onBrand`: light background for use on primary/brand surfaces
   * - `mark`: icon strokes only (uses currentColor)
   */
  variant?: "default" | "onBrand" | "mark";
}

export function Logo({
  size = 28,
  className,
  variant = "default",
  ...props
}: LogoProps) {
  const fill =
    variant === "onBrand"
      ? "var(--color-primary-foreground)"
      : variant === "mark"
        ? "none"
        : "var(--color-primary)";

  const stroke =
    variant === "mark" ? "currentColor" : "var(--color-main)";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Logo"
      {...props}
    >
      {variant !== "mark" && (
        <rect width="32" height="32" rx="8" fill={fill} />
      )}
      <g
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 7v18" />
        <path d="M10 25h12" />
        <path d="M8 11h2c2 0 4.5-.8 6-1.6 1.5.8 4 1.6 6 1.6h2" />
        <path d="m8.5 20 2.2-6 2.2 6c-.64.48-1.4.74-2.2.74s-1.56-.26-2.2-.74Z" />
        <path d="m19.1 20 2.2-6 2.2 6c-.64.48-1.4.74-2.2.74s-1.56-.26-2.2-.74Z" />
      </g>
    </svg>
  );
}
