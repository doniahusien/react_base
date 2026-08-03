/**
 * @file ThemeSwitch.tsx
 * @module @react_base/components
 * @description Enhanced theme switcher that cycles: light -> dark -> system.
 * 
 * Inspired by the mono_repo implementation but adapted for the existing
 * react_base theme system using Zustand store and Tailwind CSS.
 * 
 * Features:
 * - Three-way toggle: light -> dark -> system
 * - System preference detection and auto-switching
 * - Smooth animations and hover states
 * - Proper ARIA labels and tooltips
 * - Persistent storage of user preference
 */

import { useCallback, useEffect, useState } from 'react';
import { 
  ComputerDesktopIcon,
  MoonIcon, 
  SunIcon 
} from '@heroicons/react/24/outline';
import { Tooltip } from './Tooltip';

// ============================================================================
// Types
// ============================================================================

/** What the user picked. `system` defers to the OS color scheme. */
type ThemeIntent = 'light' | 'dark' | 'system';

/** The concrete mode rendered on the page. */
type ResolvedTheme = 'light' | 'dark';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'theme-intent';
const PREFERS_DARK = '(prefers-color-scheme: dark)';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Reads the stored user intent. Falls back to 'system' when none is stored.
 */
function readIntent(): ThemeIntent {
  if (typeof window === 'undefined') return 'system';
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored as ThemeIntent;
  }
  return 'system';
}

/**
 * Reads the current OS color-scheme preference.
 */
function readSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.(PREFERS_DARK).matches ? 'dark' : 'light';
}

/**
 * Applies the theme by setting the 'dark' class on document root.
 */
function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  
  const html = document.documentElement;
  if (resolved === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

/**
 * Returns the next intent in the cycle: light -> dark -> system -> light.
 */
function nextIntent(current: ThemeIntent): ThemeIntent {
  if (current === 'light') return 'dark';
  if (current === 'dark') return 'system';
  return 'light';
}

/**
 * Resolves an intent to a concrete mode by consulting the system preference
 * when the intent is `"system"`.
 */
function resolveIntent(intent: ThemeIntent, systemPref: ResolvedTheme): ResolvedTheme {
  return intent === 'system' ? systemPref : intent;
}

// ============================================================================
// Icon Component
// ============================================================================

/**
 * Icon rendered inside the toggle button. Shows the CURRENT theme state
 * to indicate what mode is active.
 */
function ThemeIcon({ intent, systemPref }: { intent: ThemeIntent; systemPref: ResolvedTheme }) {
  if (intent === 'system') {
    return <ComputerDesktopIcon className="size-4" />;
  }
  if (intent === 'dark') {
    return <MoonIcon className="size-4" />;
  }
  return <SunIcon className="size-4" />;
}

// ============================================================================
// Component
// ============================================================================

interface ThemeSwitchProps {
  /** Optional className for styling */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show tooltip */
  showTooltip?: boolean;
}

/**
 * Enhanced theme switcher that cycles through light -> dark -> system themes.
 * 
 * Features:
 * - Persists user preference to localStorage
 * - Automatically detects and responds to system theme changes
 * - Smooth transitions and hover effects
 * - Proper accessibility with ARIA labels
 * - Tooltip showing current mode and next action
 * 
 * @example
 * ```tsx
 * <ThemeSwitch />
 * <ThemeSwitch size="md" showTooltip={false} />
 * ```
 */
export function ThemeSwitch({ 
  className = '', 
  size = 'sm',
  showTooltip = true 
}: ThemeSwitchProps) {
  const [intent, setIntent] = useState<ThemeIntent>(() => readIntent());
  const [systemPref, setSystemPref] = useState<ResolvedTheme>(() => readSystemPreference());

  // Subscribe to OS color-scheme changes so "system" reacts live
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    const mql = window.matchMedia(PREFERS_DARK);
    const handler = (event: MediaQueryListEvent) => {
      setSystemPref(event.matches ? 'dark' : 'light');
    };
    
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Apply the resolved theme whenever intent or OS pref changes
  useEffect(() => {
    const resolved = resolveIntent(intent, systemPref);
    applyTheme(resolved);
    
    // Update localStorage to match the existing theme system
    try {
      window.localStorage.setItem('theme', resolved);
    } catch {
      // Private mode, quota, etc. — fail silently
    }
  }, [intent, systemPref]);

  const handlePress = useCallback(() => {
    setIntent((current) => {
      const next = nextIntent(current);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private mode, quota, etc. — fail silently, theme still works in-tab
      }
      return next;
    });
  }, []);

  // Generate ARIA label and tooltip text
  const getAriaLabel = () => {
    const resolved = resolveIntent(intent, systemPref);
    const currentMode = intent === 'system' ? `system (${resolved})` : intent;
    const nextMode = nextIntent(intent);
    return `Current theme: ${currentMode}. Click to switch to ${nextMode} mode`;
  };

  const getTooltipText = () => {
    const nextMode = nextIntent(intent);
    return `Switch to ${nextMode} theme`;
  };

  // Size-based classes
  const sizeClasses = {
    sm: 'size-8 text-sm',
    md: 'size-10 text-base'
  };

  const buttonClasses = `
    inline-flex items-center justify-center rounded-xl 
    border border-border bg-card text-muted-foreground
    transition-all duration-200 ease-out
    hover:text-primary hover:bg-primary/10 hover:border-primary/30
    active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50
    ${sizeClasses[size]} ${className}
  `.trim();

  const button = (
    <button
      type="button"
      onClick={handlePress}
      className={buttonClasses}
      aria-label={getAriaLabel()}
    >
      <ThemeIcon intent={intent} systemPref={systemPref} />
    </button>
  );

  // Wrap with tooltip if enabled
  if (showTooltip) {
    return (
      <Tooltip content={getTooltipText()}>
        {button}
      </Tooltip>
    );
  }

  return button;
}

/**
 * Compact variant for use in headers and toolbars
 */
export function ThemeSwitchCompact() {
  return (
    <ThemeSwitch 
      size="sm" 
      className="header-icon-btn border-0 bg-transparent hover:bg-primary/10"
      showTooltip={true}
    />
  );
}

export default ThemeSwitch;