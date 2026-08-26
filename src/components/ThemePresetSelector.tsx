/**
 * @file ThemePresetSelector.tsx
 * @description Dropdown selector for switching between theme presets
 * (violet, forest, ocean, etc.) with visual preview of colors.
 * 
 * Inspired by mono_repo's theme system but adapted for react_base's
 * existing brand theme preset architecture.
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, CheckIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { applyBrandTheme, brandPresets, type BrandTheme } from '../theme-presets';

// ============================================================================
// Types
// ============================================================================

interface ThemePresetSelectorProps {
  /** Optional className for the trigger button */
  className?: string;
  /** Show color preview in trigger */
  showPreview?: boolean;
  /** Variant style */
  variant?: 'default' | 'compact' | 'pill';
  /** Initial selected theme */
  defaultTheme?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Dropdown selector for choosing theme presets with color preview.
 * 
 * Features:
 * - Visual color preview for each theme
 * - Smooth animations and transitions
 * - Keyboard navigation support
 * - Persistent selection via localStorage
 * - Click outside to close
 * 
 * @example
 * ```tsx
 * <ThemePresetSelector />
 * <ThemePresetSelector variant="compact" />
 * <ThemePresetSelector variant="pill" defaultTheme="elwaseet" />
 * ```
 */
export function ThemePresetSelector({
  className = '',
  showPreview = true,
  variant = 'default',
  defaultTheme = 'elwaseet'
}: ThemePresetSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('selected-brand-theme') || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentTheme = brandPresets[selectedTheme];

  // Apply saved theme on mount
  useEffect(() => {
    if (selectedTheme && brandPresets[selectedTheme]) {
      applyBrandTheme(selectedTheme);
    }
  }, []); // Run only once on mount

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleThemeSelect = (themeKey: string) => {
    setSelectedTheme(themeKey);
    applyBrandTheme(themeKey);
    
    try {
      localStorage.setItem('selected-brand-theme', themeKey);
    } catch {
      // Fail silently
    }
    
    setIsOpen(false);
  };

  // Variant-specific styles
  const variantStyles = {
    default: {
      trigger: 'flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all shadow-sm',
      dropdown: 'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl'
    },
    compact: {
      trigger: 'flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-all',
      dropdown: 'absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-lg'
    },
    pill: {
      trigger: 'header-icon-btn flex items-center gap-1.5 px-3 py-1.5',
      dropdown: 'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.trigger}
        aria-label="Select theme preset"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {showPreview && currentTheme && (
          <div className="flex items-center gap-1.5">
            <div
              className="size-4 rounded-md shadow-sm ring-1 ring-black/10"
              style={{ backgroundColor: currentTheme.brand500 }}
            />
            <div
              className="size-3 rounded-sm shadow-sm ring-1 ring-black/10"
              style={{ backgroundColor: currentTheme.brand600 }}
            />
          </div>
        )}
        
        {!showPreview && variant !== 'pill' && (
          <SwatchIcon className="size-4" />
        )}
        
        <span className={variant === 'compact' ? 'hidden sm:inline' : ''}>
          {t('THEME_PRESET.theme') || currentTheme?.name || 'Theme'}
        </span>
        
        <ChevronDownIcon 
          className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 lg:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className={styles.dropdown} role="listbox">
            {/* Header */}
            <div className="border-b border-border px-4 py-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <SwatchIcon className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t('THEME_PRESET.title') || 'Theme Presets'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('THEME_PRESET.subtitle') || 'Choose your brand color scheme'}
                  </p>
                </div>
              </div>
            </div>

            {/* Theme List */}
            <div className="max-h-96 overflow-y-auto p-2">
              {Object.entries(brandPresets).map(([key, theme]) => {
                const isActive = selectedTheme === key;
                
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleThemeSelect(key)}
                    role="option"
                    aria-selected={isActive}
                    className={`
                      flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left
                      transition-all duration-150
                      ${isActive 
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/20' 
                        : 'text-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    {/* Color Preview */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div
                        className="size-6 rounded-lg shadow-sm ring-1 ring-black/10 transition-transform hover:scale-110"
                        style={{ backgroundColor: theme.brand500 }}
                      />
                      <div
                        className="size-4 rounded-md shadow-sm ring-1 ring-black/10 transition-transform hover:scale-110"
                        style={{ backgroundColor: theme.brand600 }}
                      />
                    </div>
                    
                    {/* Theme Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {t(`THEME_PRESET.${key}`, { defaultValue: theme.name })}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t(`THEME_PRESET.${key}Desc`, { defaultValue: theme.description })}
                      </p>
                    </div>
                    
                    {/* Selected Indicator */}
                    {isActive && (
                      <CheckIcon className="size-4 text-primary shrink-0" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Tip */}
            <div className="border-t border-border bg-muted/30 px-4 py-3">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="font-semibold">💡 {t('THEME_PRESET.tip') || 'Tip'}:</span>{' '}
                {t('THEME_PRESET.tipText') || 'Theme colors are applied dynamically. To make permanent changes, edit the CSS variables in'}{' '}
                <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">index.css</code>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact variant for use in headers and toolbars
 */
export function ThemePresetSelectorCompact() {
  return <ThemePresetSelector variant="compact" showPreview={true} />;
}

/**
 * Pill variant for use in control panels
 */
export function ThemePresetSelectorPill() {
  return <ThemePresetSelector variant="pill" showPreview={true} />;
}

export default ThemePresetSelector;