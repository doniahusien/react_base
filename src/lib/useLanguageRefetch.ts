import { useEffect, useRef } from "react";
import { onLanguageChange } from "./languageChangeEvent";

/**
 * Hook that triggers a callback when the language changes globally
 * Useful for refetching data when user switches language
 * 
 * @param callback - Function to call when language changes
 * 
 * @example
 * // In your component with fetchData function
 * useLanguageRefetch(fetchData);
 */
export function useLanguageRefetch(callback: () => void | Promise<void>) {
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Listen for global language change events
    const cleanup = onLanguageChange(() => {
      callbackRef.current();
    });

    return cleanup;
  }, []);
}
