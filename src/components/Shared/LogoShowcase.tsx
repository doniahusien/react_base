import { Logo } from "./Logo";

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
          <circle cx="160" cy="12" r="4" />
        </g>
        <g className="login-logo-orbit-sat login-logo-orbit-sat-2">
          <circle cx="278" cy="160" r="3" />
        </g>
        <g className="login-logo-orbit-sat login-logo-orbit-sat-3">
          <circle cx="160" cy="248" r="2.5" />
        </g>
      </svg>

      <div className="login-logo-glow login-logo-glow-1" />
      <div className="login-logo-glow login-logo-glow-2" />

      <div className="login-logo-badge">
        <div className="login-logo-shine" />
        <Logo variant="onBrand" size={112} className="login-logo-mark" />
      </div>

      <div className="login-logo-particles">
        {[
          { top: "18%", left: "22%", delay: "0s" },
          { top: "72%", left: "18%", delay: "1.2s" },
          { top: "28%", left: "78%", delay: "2.1s" },
          { top: "68%", left: "76%", delay: "0.8s" },
          { top: "12%", left: "58%", delay: "1.8s" },
          { top: "82%", left: "46%", delay: "2.6s" },
        ].map((particle, index) => (
          <span
            key={index}
            className="login-logo-particle"
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
