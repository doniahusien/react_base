import { MoonIcon as Moon, SunIcon as Sun } from "@heroicons/react/24/outline";
import { useAppStore } from "../../store";

interface ThemeSwitcherProps {
  /**
   * Display variant
   * - 'icon': Just the icon button (default)
   * - 'pill': Icon button inside a pill container
   * - 'button': Full button with text
   */
  variant?: "icon" | "pill" | "button";
  /**
   * Custom icon size
   */
  iconSize?: number;
  /**
   * Custom class name for the button
   */
  className?: string;
  /**
   * Show label text (only for 'button' variant)
   */
  showLabel?: boolean;
}

export function ThemeSwitcher({
  variant = "icon",
  iconSize = 15,
  className,
  showLabel = true,
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useAppStore();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const IconComponent = theme === "dark" ? Moon : Sun;

  // Icon-only variant
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={className || "header-icon-btn"}
        aria-label="Toggle theme"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        <IconComponent width={iconSize} height={iconSize} />
      </button>
    );
  }

  // Pill variant (wrapped in pill container)
  if (variant === "pill") {
    return (
      <div className="header-pill">
        <button
          type="button"
          onClick={toggleTheme}
          className={className || "header-icon-btn"}
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <IconComponent width={iconSize} height={iconSize} />
        </button>
      </div>
    );
  }

  // Button variant with optional label
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={
        className ||
        "flex items-center gap-2 rounded-xl border border-border px-4 py-2 transition-all duration-300 hover:bg-primary/5 hover:border-primary/30"
      }
      aria-label="Toggle theme"
    >
      <IconComponent width={iconSize} height={iconSize} />
      {showLabel && (
        <span className="text-sm font-medium">
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </button>
  );
}
