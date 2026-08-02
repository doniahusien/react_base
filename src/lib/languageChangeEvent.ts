/**
 * Global event system for language changes
 * Allows components to automatically refetch when language changes
 */

const LANGUAGE_CHANGE_EVENT = "app:language-changed";

export function emitLanguageChange(newLanguage: string) {
  const event = new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language: newLanguage } });
  window.dispatchEvent(event);
}

export function onLanguageChange(callback: (language: string) => void) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ language: string }>;
    callback(customEvent.detail.language);
  };
  
  window.addEventListener(LANGUAGE_CHANGE_EVENT, handler);
  
  // Return cleanup function
  return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handler);
}
