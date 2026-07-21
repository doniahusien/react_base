# 🎨 Theme Customization Guide

This base project is designed to be **brand-agnostic** and **easily customizable** for any project. Change your entire brand identity in minutes!

## Quick Start (3 Steps)

### 1️⃣ Choose Your Brand Color

Open `src/index.css` and find the `@theme` section at the top. Change these two values:

```css
--brand-500: #8b7dd8;  /* Your main brand color */
--brand-600: #6a5acd;  /* Darker shade for hovers */
```

### 2️⃣ (Optional) Use a Preset

Uncomment one of the preset color schemes in `src/index.css`:

```css
/* BLUE (trust, corporate) */
--brand-500: #3b82f6;
--brand-600: #2563eb;
```

Available presets:
- 🟣 **Purple** (default) - Professional, modern
- 🔵 **Blue** - Corporate, trustworthy
- 🟢 **Teal** - Tech, modern
- 🟩 **Emerald** - Fresh, eco-friendly
- 🟠 **Orange** - Energetic, creative
- 🌹 **Rose** - Elegant, feminine
- 🔷 **Indigo** - Premium, deep
- 🟡 **Amber** - Warm, welcoming
- ⚫ **Gray** - Minimal, neutral

### 3️⃣ (Optional) Adjust Neutral Colors

For a warmer or cooler feel, adjust the neutral palette:

```css
/* For WARM feel */
--neutral-50:  #faf9f7;  /* Warmer white */
--neutral-700: #444444;  /* Warmer gray */

/* For COOL feel */
--neutral-50:  #f5f7fa;  /* Cooler white */
--neutral-700: #3d4852;  /* Cooler gray */
```

---

## What Changes Automatically

When you update brand colors, these components automatically adapt:

✅ **Buttons** - Primary actions, hovers, states  
✅ **Links & Navigation** - Active states, breadcrumbs  
✅ **Form Inputs** - Focus rings, validation  
✅ **Icons & Badges** - Accent highlights  
✅ **Charts** - Primary data series  
✅ **Headers** - Page headers, section dividers  
✅ **Borders** - Focus states, active elements  

---

## Advanced Customization

### Custom Color Palette

For a fully custom palette, use [UI Colors](https://uicolors.app):

1. Go to https://uicolors.app
2. Enter your brand color
3. Generate a full palette
4. Use the 500 and 600 values:

```css
--brand-500: #YOUR_GENERATED_500;
--brand-600: #YOUR_GENERATED_600;
```

### Multi-Brand Support

For projects with multiple brands, create theme variants:

```css
/* Default theme stays in @theme */

/* Brand A variant */
[data-brand="brandA"] {
  --brand-500: #3b82f6;
  --brand-600: #2563eb;
}

/* Brand B variant */
[data-brand="brandB"] {
  --brand-500: #10b981;
  --brand-600: #059669;
}
```

Then set the attribute in your app:
```tsx
<div data-brand="brandA">...</div>
```

### Sidebar Customization

The sidebar has its own gradient. To match your brand:

```css
--sidebar-top:    #0f0a1a;  /* Top gradient color */
--sidebar-mid:    #1a0d3a;  /* Middle gradient color */
--sidebar-bottom: #05020a;  /* Bottom gradient color */
```

Or use your brand colors:
```css
/* Example: Blue sidebar */
--sidebar-top:    hsl(220, 60%, 10%);
--sidebar-mid:    hsl(220, 65%, 15%);
--sidebar-bottom: hsl(220, 70%, 8%);
```

---

## Component Overrides

### Keeping Specific Colors

If you want certain components to NOT use the brand color:

1. **Dashboard StatCards** - Uses multi-color accents (violet/blue/emerald/amber)
   - Already independent, no changes needed
   
2. **Error/Success States** - Uses semantic colors (red/green)
   - Already independent, no changes needed

### Custom Section Colors

For SectionCard colors, these are already built-in:
- `primary` - Uses your brand color
- `blue`, `emerald`, `orange`, `rose`, `sky` - Fixed accent colors

---

## Testing Your Theme

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Check both themes:**
   - Toggle light/dark mode
   - Check all pages
   - Verify buttons, inputs, and navigation

3. **Common checks:**
   - [ ] Primary buttons visible and readable
   - [ ] Focus states clear and accessible
   - [ ] Links distinguishable from text
   - [ ] Form validation messages clear
   - [ ] Active navigation items highlighted

---

## Example Workflows

### Corporate Blue Project
```css
--brand-500: #2563eb;
--brand-600: #1d4ed8;
```

### Healthcare Green Project
```css
--brand-500: #10b981;
--brand-600: #059669;
```

### Creative Agency Orange Project
```css
--brand-500: #f97316;
--brand-600: #ea580c;
```

### E-commerce Purple Project
```css
--brand-500: #a855f7;
--brand-600: #9333ea;
```

---

## Best Practices

1. ✅ **Always test both light and dark modes**
2. ✅ **Check contrast ratios for accessibility** (use [WebAIM](https://webaim.org/resources/contrastchecker/))
3. ✅ **Keep brand colors vibrant but not eye-straining**
4. ✅ **Use neutral grays for most UI, brand color for accents only**
5. ✅ **Test on different screen types** (IPS, OLED, etc.)

---

## Troubleshooting

**Q: My colors look washed out in dark mode**  
A: Increase saturation in `--brand-500` for dark mode, or add a separate dark mode override.

**Q: Text is hard to read**  
A: Adjust `--neutral-700` and `--neutral-600` for better contrast.

**Q: Buttons don't stand out**  
A: Make sure `--brand-500` has enough saturation and contrast against `--color-panel`.

**Q: I want a completely different color system**  
A: You can replace the entire `@theme` block with your own CSS variables. Just keep the same variable names (`--color-*`) and everything will work.

---

## Support

For color palette inspiration:
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)
- [UI Colors Generator](https://uicolors.app)
- [Coolors Palette Generator](https://coolors.co)
- [Adobe Color Wheel](https://color.adobe.com)

For accessibility checking:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessible Colors](https://accessible-colors.com)
