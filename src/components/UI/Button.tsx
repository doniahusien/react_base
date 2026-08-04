import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "soft" | "danger" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: ReactNode;
  reverse?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95",
  secondary:
    "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
  soft:
    "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
  danger:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-95",
  outline:
    "border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
  ghost:
    "text-muted-foreground hover:bg-muted hover:text-foreground",
  link:
    "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "h-12 min-w-[100px] max-w-[200px] px-4 text-sm",
};

export function Button({
  children,
  reverse,
  className = "",
  type = "button",
  disabled,
  loading,
  variant,
  size = "md",
  ...props
}: ButtonProps) {
  const resolvedVariant = variant ?? (reverse ? "secondary" : "primary");

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        baseClasses,
        variantClasses[resolvedVariant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export default Button;
