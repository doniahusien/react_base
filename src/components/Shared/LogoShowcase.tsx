import { AnimatedLogo } from "./AnimatedLogo";

interface LogoShowcaseProps {
  className?: string;
}

export function LogoShowcase({ className }: LogoShowcaseProps) {
  return (
    <div
      className={`login-logo-showcase ${className ?? ""}`.trim()}
      aria-hidden
    >
      <svg
        className="login-logo-orbit-svg"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="160"
          cy="160"
          r="148"
          className="login-logo-orbit-track login-logo-orbit-track-1"
        />
        <circle
          cx="160"
          cy="160"
          r="118"
          className="login-logo-orbit-track login-logo-orbit-track-2"
        />
        <circle
          cx="160"
          cy="160"
          r="88"
          className="login-logo-orbit-track login-logo-orbit-track-3"
        />

        <g className="login-logo-orbit-sat login-logo-orbit-sat-1">
          <circle cx="160" cy="12" r="3.5" />
        </g>
        <g className="login-logo-orbit-sat login-logo-orbit-sat-2">
          <circle cx="278" cy="160" r="2.5" />
        </g>
        <g className="login-logo-orbit-sat login-logo-orbit-sat-3">
          <circle cx="160" cy="248" r="2" />
        </g>
      </svg>

      <div className="login-logo-glow" />
      <AnimatedLogo size={168} />
    </div>
  );
}
