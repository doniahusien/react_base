import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { onLanguageChange } from "../lib/languageChangeEvent";

/**
 * Global component that automatically refreshes the page when language changes
 * Add this once in your Layout component
 */
export function LanguageRefreshManager() {
  const location = useLocation();

  useEffect(() => {
    const cleanup = onLanguageChange(() => {
      // Force a page reload to refetch all data with new language
      window.location.reload();
    });

    return cleanup;
  }, [location.pathname]);

  return null;
}
