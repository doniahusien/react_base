import type { SVGProps } from "react";

interface AnimatedLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function AnimatedLogo({
  size = 168,
  className,
  ...props
}: AnimatedLogoProps) {
  const strokeProps = {
    fill: "none" as const,
    stroke: "var(--color-main)",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={`login-animated-logo ${className ?? ""}`.trim()}
      role="img"
      aria-label="Logo"
      {...props}
    >
      <g {...strokeProps}>
        <g className="login-logo-static">
          <path d="M16 7v18" />
          <path d="M10 25h12" />
        </g>

        {/* Pivot at fulcrum — same sway as website 404 scale */}
        <g transform="translate(16 11)">
          <g className="login-logo-sway">
            <g transform="translate(-16 -11)">
              <path d="M8 11h2c2 0 4.5-.8 6-1.6 1.5.8 4 1.6 6 1.6h2" />
              <path d="m8.5 20 2.2-6 2.2 6c-.64.48-1.4.74-2.2.74s-1.56-.26-2.2-.74Z" />
              <path d="m19.1 20 2.2-6 2.2 6c-.64.48-1.4.74-2.2.74s-1.56-.26-2.2-.74Z" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
