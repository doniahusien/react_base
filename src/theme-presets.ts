/**
 * Theme Presets
 *
 * Pre-configured brand color schemes for quick project setup.
 * Import and apply these in your app to instantly change the brand colors.
 */

export interface BrandTheme {
  name: string;
  brand500: string;
  brand600: string;
  description: string;
}

export const brandPresets: Record<string, BrandTheme> = {
  purple: {
    name: 'Purple',
    brand500: '#8b7dd8',
    brand600: '#6a5acd',
    description: 'Professional, modern (default)',
  },
  blue: {
    name: 'Blue',
    brand500: '#3b82f6',
    brand600: '#2563eb',
    description: 'Corporate, trustworthy',
  },
  teal: {
    name: 'Teal',
    brand500: '#14b8a6',
    brand600: '#0d9488',
    description: 'Modern, tech',
  },
  emerald: {
    name: 'Emerald',
    brand500: '#10b981',
    brand600: '#059669',
    description: 'Fresh, eco-friendly',
  },
  orange: {
    name: 'Orange',
    brand500: '#f97316',
    brand600: '#ea580c',
    description: 'Energetic, creative',
  },
  rose: {
    name: 'Rose',
    brand500: '#f43f5e',
    brand600: '#e11d48',
    description: 'Elegant, feminine',
  },
  indigo: {
    name: 'Indigo',
    brand500: '#6366f1',
    brand600: '#4f46e5',
    description: 'Premium, deep',
  },
  amber: {
    name: 'Amber',
    brand500: '#f59e0b',
    brand600: '#d97706',
    description: 'Warm, welcoming',
  },
  gray: {
    name: 'Gray',
    brand500: '#6b7280',
    brand600: '#4b5563',
    description: 'Minimal, neutral',
  },
};

/**
 * Apply a brand theme dynamically
 *
 * @example
 * import { applyBrandTheme } from './theme-presets';
 *
 * // Apply preset
 * applyBrandTheme('blue');
 *
 * // Apply custom colors
 * applyBrandTheme({ brand500: '#ff0000', brand600: '#cc0000' });
 */
export function applyBrandTheme(
  themeKeyOrColors: string | { brand500: string; brand600: string }
): void {
  const root = document.documentElement;

  const colors =
    typeof themeKeyOrColors === 'string'
      ? brandPresets[themeKeyOrColors]
      : themeKeyOrColors;

  if (!colors) {
    console.warn(
      `Theme preset "${themeKeyOrColors}" not found. Available: ${Object.keys(brandPresets).join(', ')}`
    );
    return;
  }

  root.style.setProperty('--color-primary', colors.brand500);
  root.style.setProperty('--color-ring', colors.brand500);
  root.style.setProperty('--color-secondary', colors.brand600);
}

/**
 * Get the current brand colors
 */
export function getCurrentBrandTheme(): { brand500: string; brand600: string } {
  const root = document.documentElement;
  const computed = getComputedStyle(root);

  return {
    brand500: computed.getPropertyValue('--color-primary').trim(),
    brand600: computed.getPropertyValue('--color-secondary').trim(),
  };
}

/**
 * Reset to default theme
 */
export function resetBrandTheme(): void {
  applyBrandTheme('purple');
}
