/**
 * Theme Switcher Example Component
 * 
 * This is an EXAMPLE component showing how to dynamically switch brand themes.
 * You can add this to your settings page or admin panel.
 * 
 * Usage:
 * import { ThemeSwitcherExample } from './components/ThemeSwitcherExample';
 * <ThemeSwitcherExample />
 */

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { applyBrandTheme, brandPresets, getCurrentBrandTheme } from '../theme-presets';

export function ThemeSwitcherExample() {
  const [current, setCurrent] = useState<string>('purple');
  
  const handleThemeChange = (themeKey: string) => {
    applyBrandTheme(themeKey);
    setCurrent(themeKey);
  };

  return (
    <div className="rounded-2xl border border-border bg-panel p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Palette size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-text">Brand Theme</h3>
          <p className="text-sm text-muted">Choose your brand color scheme</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Object.entries(brandPresets).map(([key, theme]) => {
          const isActive = current === key;
          
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleThemeChange(key)}
              className={`group relative flex flex-col items-start gap-2 rounded-xl border p-3 transition-all hover:shadow-md ${
                isActive
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-panel-soft hover:border-border/60'
              }`}
            >
              {isActive && (
                <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div
                  className="size-6 rounded-lg shadow-sm ring-1 ring-black/10"
                  style={{ backgroundColor: theme.brand500 }}
                />
                <div
                  className="size-4 rounded-md shadow-sm ring-1 ring-black/10"
                  style={{ backgroundColor: theme.brand600 }}
                />
              </div>
              
              <div className="text-left">
                <p className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-text'}`}>
                  {theme.name}
                </p>
                <p className="text-[10px] text-muted">{theme.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-panel-alt p-4">
        <p className="text-xs font-medium text-muted">
          💡 <strong>Tip:</strong> To permanently change the theme, update the{' '}
          <code className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">--brand-500</code> and{' '}
          <code className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">--brand-600</code>{' '}
          values in <code className="rounded bg-panel-soft px-1.5 py-0.5">src/index.css</code>
        </p>
      </div>
    </div>
  );
}

/**
 * Compact Theme Switcher for Header/Toolbar
 */
export function ThemeSwitcherCompact() {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<string>('purple');

  const handleThemeChange = (themeKey: string) => {
    applyBrandTheme(themeKey);
    setCurrent(themeKey);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2 text-sm font-medium text-text hover:bg-panel-alt transition-all"
        aria-label="Change theme"
      >
        <Palette size={16} />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-panel shadow-xl">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-text">Brand Theme</p>
              <p className="text-xs text-muted">Preview available themes</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {Object.entries(brandPresets).map(([key, theme]) => {
                const isActive = current === key;
                
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleThemeChange(key)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text hover:bg-panel-soft'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="size-5 rounded-lg ring-1 ring-black/10"
                        style={{ backgroundColor: theme.brand500 }}
                      />
                      <div
                        className="size-3 rounded-md ring-1 ring-black/10"
                        style={{ backgroundColor: theme.brand600 }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{theme.name}</p>
                    </div>
                    {isActive && <Check size={14} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
