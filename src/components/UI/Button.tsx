import type { ReactNode } from "react";

interface ButtonProps {
  children?: ReactNode;
  reverse?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ children, reverse, className = "", onClick, type = "button", disabled, loading }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 h-12 min-w-[100px] max-w-[200px] px-4 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = reverse
    ? "bg-body border border-border text-text hover:bg-border/20"
    : "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800";
  return (
    <button type={type} disabled={disabled || loading} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

export default Button;
