import { useTranslation } from "react-i18next";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useAppStore } from "../../store";

interface LanguageSwitcherProps {
  /**
   * Display variant
   * - 'pills': Toggle pills (default, used in header)
   * - 'dropdown': Dropdown menu
   * - 'buttons': Separate full buttons
   */
  variant?: "pills" | "dropdown" | "buttons";
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Show labels (for dropdown/buttons variants)
   */
  showLabels?: boolean;
}

export function LanguageSwitcher({
  variant = "pills",
  className,
  showLabels = true,
}: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const { lang, setLang } = useAppStore();

  // Pills variant (default for header)
  if (variant === "pills") {
    const buttons = (
      <>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`header-lang-btn ${lang === "en" ? "header-lang-active" : "header-lang-idle"}`}
          aria-label="Switch to English"
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLang("ar")}
          className={`header-lang-btn ${lang === "ar" ? "header-lang-active" : "header-lang-idle"}`}
          aria-label="Switch to Arabic"
        >
          AR
        </button>
      </>
    );

    // If custom className is provided, render without default container
    if (className) {
      return <div className={className}>{buttons}</div>;
    }

    // Default with header-pill container
    return <div className="header-pill">{buttons}</div>;
  }

  // Buttons variant (separate full buttons)
  if (variant === "buttons") {
    return (
      <div className={className || "flex gap-2"}>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-300 ${
            lang === "en"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-foreground hover:border-primary/30 hover:bg-primary/5"
          }`}
          aria-label="Switch to English"
        >
          {showLabels && (
            <>
              <GlobeAltIcon className="w-4 h-4" />
              <span>English</span>
            </>
          )}
          {!showLabels && "EN"}
        </button>
        <button
          type="button"
          onClick={() => setLang("ar")}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-300 ${
            lang === "ar"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-foreground hover:border-primary/30 hover:bg-primary/5"
          }`}
          aria-label="Switch to Arabic"
        >
          {showLabels && (
            <>
              <GlobeAltIcon className="w-4 h-4" />
              <span>العربية</span>
            </>
          )}
          {!showLabels && "AR"}
        </button>
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={className || "relative"}>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as "en" | "ar")}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Select language"
      >
        <option value="en">{showLabels ? "English" : "EN"}</option>
        <option value="ar">{showLabels ? "العربية" : "AR"}</option>
      </select>
    </div>
  );
}
