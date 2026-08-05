# Header Styling Guide

## Unified Control Styling

All header controls (Settings, Theme, Language) are now unified within a single pill container for consistent appearance.

### Structure

```tsx
<div className="header-pill">
  {/* Settings Button */}
  <button className="header-icon-btn">
    <Settings2 />
  </button>
  
  {/* Divider */}
  <div className="h-4 w-px bg-border/70" />
  
  {/* Theme Switcher */}
  <ThemeSwitcher variant="icon" iconSize={15} />
  
  {/* Divider */}
  <div className="h-4 w-px bg-border/70" />
  
  {/* Language Switcher */}
  <LanguageSwitcher variant="pills" className="flex items-center gap-0.5" />
</div>
```

## Style Classes

### `.header-pill`
Container that groups related controls together

**Properties:**
- Border: `border border-border`
- Background: `color-mix(in srgb, var(--color-border) 30%, transparent)`
- Rounded: `rounded-xl`
- Padding: `p-1`
- Transition: `all 0.3s ease-in-out`
- Hover: Slight background change and lift effect

### `.header-icon-btn`
Individual icon buttons within the pill

**Properties:**
- Display: `flex items-center justify-center`
- Size: Auto-sized based on content
- Padding: `p-[0.35rem]`
- Rounded: `rounded-lg`
- Color: `text-muted-foreground`
- Hover: `text-foreground` with primary background tint
- Transition: `all 300ms ease-in-out`
- Scale on hover: `scale(1.1)`

### `.header-lang-btn`
Language toggle buttons

**Properties:**
- Rounded: `rounded-lg`
- Padding: `px-[0.55rem] py-0.5`
- Font: `text-[0.7rem] font-semibold tracking-wide`
- Transition: `all 300ms ease-in-out`

**States:**
- **Active** (`.header-lang-active`):
  - Color: `text-primary`
  - Background: `color-mix(in srgb, var(--color-primary) 15%, transparent)`
  - Border: `1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)`

- **Idle** (`.header-lang-idle`):
  - Color: `text-muted-foreground`
  - Border: `transparent`
  - Hover: `text-foreground` with subtle background
  - Hover lift: `translateY(-1px)`

## Unified Features

✅ **Same Height**: All controls aligned vertically
✅ **Same Rounded Corners**: Consistent border-radius (`rounded-lg` for inner, `rounded-xl` for container)
✅ **Same Transitions**: All use 300ms ease-in-out
✅ **Same Hover Effects**: Scale and background changes
✅ **Same Spacing**: Consistent gap between elements (`gap-0.5`)
✅ **Same Dividers**: Vertical lines (`h-4 w-px bg-border/70`)

## Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ header-pill (rounded-xl, border, background)                │
│  ┌────────┐  │  ┌────────┐  │  ┌──────┬──────┐            │
│  │ ⚙️ Gear │  │  │ 🌙 Moon│  │  │ EN   │  AR  │            │
│  │Settings│  │  │ Theme  │  │  │ Lang │ Lang │            │
│  └────────┘  │  └────────┘  │  └──────┴──────┘            │
│   icon-btn      icon-btn         lang-btn pills            │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥1024px)
- All controls visible
- Full pill with all three sections
- Dividers visible between controls

### Tablet (768px - 1023px)
- All controls visible
- Slightly smaller spacing

### Mobile (<768px)
- Settings and Theme in one pill
- Language may wrap to separate pill or be in mobile menu
- Simplified layout

## Customization

To maintain consistency when adding new controls:

```tsx
// Add a new control to the pill
<div className="header-pill">
  {/* Existing controls... */}
  
  {/* New control */}
  <div className="h-4 w-px bg-border/70" />
  <button className="header-icon-btn">
    <YourIcon width={15} height={15} />
  </button>
</div>
```

## Accessibility

✅ **Keyboard Navigation**: All buttons are keyboard accessible
✅ **ARIA Labels**: Each button has descriptive aria-label
✅ **Focus Indicators**: Visible focus rings
✅ **Screen Reader**: Proper announcements for state changes
✅ **Touch Targets**: Minimum 44x44px for mobile

## CSS Variables Used

```css
--color-border
--color-primary
--color-muted-foreground
--color-foreground
```

## Animation Details

**Hover States:**
- Icon buttons: `transform: scale(1.1)`
- Language buttons: `transform: translateY(-1px)`
- Pill container: Slight background intensity increase

**Timing:**
- All transitions: `300ms ease-in-out`
- Consistent with sidebar and other UI elements
