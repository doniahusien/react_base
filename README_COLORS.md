# 🎨 Base React Project - Color System

This is a **brand-agnostic base template** designed to be customized for any project in minutes.

## 🚀 Quick Customization (30 seconds)

### Method 1: Edit CSS (Recommended)

Open `src/index.css` and change these two lines:

```css
--brand-500: #YOUR_COLOR_HERE;  /* Main brand color */
--brand-600: #YOUR_DARKER_SHADE; /* Hover/active state */
```

**That's it!** The entire app adapts automatically. ✨

### Method 2: Use Presets

Uncomment one of the ready-made presets in `src/index.css`:

```css
/* BLUE (trust, corporate) */
--brand-500: #3b82f6;
--brand-600: #2563eb;
```

Available: Purple (default), Blue, Teal, Emerald, Orange, Rose, Indigo, Amber, Gray

### Method 3: Programmatic (Dynamic)

Use the theme utility functions:

```typescript
import { applyBrandTheme } from './theme-presets';

// Apply preset
applyBrandTheme('blue');

// Or custom colors
applyBrandTheme({ brand500: '#ff0000', brand600: '#cc0000' });
```

---

## 📁 Project Structure

```
src/
├── index.css              # 👈 Main theme configuration
├── theme-presets.ts       # 👈 Preset colors & utilities
├── components/            # All components use semantic tokens
│   ├── UI/
│   ├── Inputs/
│   └── Shared/
└── routes/                # Pages automatically inherit theme
```

---

## 🎯 What's Customizable

| Element | Customization Level | How |
|---------|---------------------|-----|
| **Brand Color** | ⭐⭐⭐ Primary | Change `--brand-500` & `--brand-600` |
| **Neutral Palette** | ⭐⭐ Secondary | Adjust `--neutral-*` values |
| **Sidebar Style** | ⭐ Optional | Modify `--sidebar-*` gradients |
| **Component Styles** | 🔒 Not needed | Uses semantic tokens automatically |

---

## 🎨 Design Philosophy

### 1. Semantic Tokens
Components use **semantic names**, not colors directly:
```css
/* ✅ Good - semantic */
.button { background: var(--color-primary); }

/* ❌ Avoid - hardcoded */
.button { background: #8b7dd8; }
```

### 2. Single Source of Truth
All brand colors defined in ONE place: `@theme` block in `index.css`

### 3. Neutral-First UI
Most UI uses neutral grays. Brand color used sparingly for:
- Primary actions (buttons, links)
- Active states (navigation, tabs)
- Important highlights (badges, notifications)

### 4. Accessible by Default
- Sufficient contrast ratios (WCAG AA compliant)
- Reduced eye strain (softer colors)
- Works in both light and dark modes

---

## 💼 Example Use Cases

### Corporate Dashboard
```css
--brand-500: #2563eb;  /* Trust blue */
--brand-600: #1d4ed8;
```

### Healthcare Portal
```css
--brand-500: #10b981;  /* Medical green */
--brand-600: #059669;
```

### E-commerce Admin
```css
--brand-500: #f43f5e;  /* Attention rose */
--brand-600: #e11d48;
```

### SaaS Platform
```css
--brand-500: #6366f1;  /* Tech indigo */
--brand-600: #4f46e5;
```

---

## 🛠️ Advanced Features

### Multi-Brand Support
Add theme attributes for different brands:

```css
[data-brand="client-a"] {
  --brand-500: #3b82f6;
  --brand-600: #2563eb;
}

[data-brand="client-b"] {
  --brand-500: #10b981;
  --brand-600: #059669;
}
```

### Per-Page Themes
Override colors for specific pages:

```tsx
<div style={{ '--brand-500': '#f59e0b', '--brand-600': '#d97706' }}>
  {/* This page uses orange theme */}
</div>
```

### Runtime Theme Switching
```tsx
import { applyBrandTheme, brandPresets } from './theme-presets';

function ThemeSwitcher() {
  return (
    <select onChange={(e) => applyBrandTheme(e.target.value)}>
      {Object.keys(brandPresets).map(key => (
        <option key={key} value={key}>
          {brandPresets[key].name}
        </option>
      ))}
    </select>
  );
}
```

---

## ✅ Testing Checklist

Before deploying with new colors:

- [ ] Test both light and dark modes
- [ ] Check button visibility and contrast
- [ ] Verify link colors are distinguishable
- [ ] Test form focus states
- [ ] Check active navigation states
- [ ] Verify accessibility contrast ratios
- [ ] Test on different screens (IPS, OLED, etc.)

---

## 📚 Resources

**Color Palette Generators:**
- [UI Colors](https://uicolors.app) - Generate full palettes from one color
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors) - Official color scales
- [Coolors](https://coolors.co) - Palette inspiration

**Accessibility:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessible Colors](https://accessible-colors.com)

**Documentation:**
- See `CUSTOMIZATION.md` for detailed guide
- See `src/index.css` inline comments for quick reference

---

## 🤝 Contributing

When adding new components, use semantic tokens:

```tsx
// ✅ Good
className="bg-primary text-white border-accent"

// ❌ Avoid
className="bg-purple-600 text-white border-purple-400"
```

This ensures all components adapt to theme changes automatically.

---

## 📄 License

This color system is part of the base template and can be used in any project without restrictions.

---

**Made with 💜 by your team** | Customize in seconds, use forever ✨
