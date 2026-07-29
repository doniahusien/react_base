# Filter Component - Floating Popup Style

## ✅ What Changed

Your Filter component is now a **floating popup panel** that appears when clicking a trigger button - just like in your reference image!

### Features
- **Floating Panel**: Appears on click, positioned in top-right
- **Backdrop Overlay**: Semi-transparent dark overlay behind panel
- **Close Actions**: Click outside, press Escape, or click X button to close
- **Smooth Animations**: Slide-in animation with fade effect
- **Accordion Sections**: Collapsible filter sections with icons
- **Checkbox Support**: Multi-select filters with custom styled checkboxes
- **Action Buttons**: Apply & Clear all buttons at the bottom
- **Glassmorphism Design**: Uses your color variables
- **Dark Mode Support**: Works in both light and dark themes

---

## 🎨 Design Features

1. **Floating Panel**: Fixed position in top-right corner (320px width)
2. **Glass Effect**: Backdrop blur with semi-transparent background
3. **Backdrop Overlay**: Dark overlay with blur when panel is open
4. **Smooth Animations**: 
   - Slide-in from right
   - Fade-in backdrop
   - Scale animation
5. **Scrollable Content**: Long filter lists scroll inside the panel
6. **No Hardcoded Colors**: All colors use CSS variables from `index.css`

---

## 📍 Where to View

Navigate to: **`/categories`**

You'll see a **"Filters"** button in the top-right of the page header. Click it to open the floating filter panel!

---

## 🔧 How to Use

### Basic Implementation

```tsx
import { Filter, type FilterSection } from "../../components/Filter/Filter";
import { Search, CheckSquare, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

function MyPage() {
  const { t } = useTranslation();
  
  const filterSections: FilterSection[] = [
    // Text search
    { 
      key: "search", 
      label: "Search",
      icon: Search,
      type: "text",
      placeholder: "Type to search...",
      defaultOpen: true
    },
    
    // Checkboxes for categories
    { 
      key: "categories", 
      label: "Categories",
      icon: CheckSquare,
      type: "checkbox",
      options: [
        { id: "fashion", label: "Fashion" },
        { id: "appliances", label: "Home Appliances" },
        { id: "beauty", label: "Health & Beauty" },
        { id: "toys", label: "Toys & Games" },
        { id: "groceries", label: "Groceries" }
      ],
      defaultOpen: true
    },
  ];

  return (
    <div>
      {/* Add to PageHeader rightActions prop */}
      <PageHeader
        title="products"
        rightActions={
          <Filter 
            sections={filterSections} 
            onApply={fetchData} 
            onClear={fetchData}
            triggerButton={
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all shadow-sm"
              >
                <SlidersHorizontal size={18} />
                <span>{t("TITLES.filters")}</span>
              </button>
            }
          />
        }
      />
      
      {/* OR use standalone */}
      <Filter 
        sections={filterSections} 
        onApply={fetchData} 
        onClear={fetchData}
        triggerButton={
          <button className="...">
            <FilterIcon size={20} />
          </button>
        }
      />
    </div>
  );
}
```

---

## 📊 Custom Trigger Button

You can customize the trigger button however you want:

### Icon Only Button
```tsx
<Filter 
  sections={filterSections}
  onApply={fetchData}
  onClear={fetchData}
  triggerButton={
    <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white hover:bg-primary-hover transition-all">
      <SlidersHorizontal size={20} />
    </button>
  }
/>
```

### Text Button
```tsx
<Filter 
  sections={filterSections}
  onApply={fetchData}
  onClear={fetchData}
  triggerButton={
    <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">
      Open Filters
    </button>
  }
/>
```

### Badge Button (with filter count)
```tsx
<Filter 
  sections={filterSections}
  onApply={fetchData}
  onClear={fetchData}
  triggerButton={
    <button className="relative px-4 py-2 rounded-xl bg-primary text-white">
      <SlidersHorizontal size={18} />
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        3
      </span>
    </button>
  }
/>
```

---

## 🎯 Filter Types

### 1. **Text Input** (`type: "text"`)
```tsx
{ 
  key: "search", 
  label: "Search Products",
  icon: Search,
  type: "text",
  placeholder: "Type to search...",
  defaultOpen: true
}
```

### 2. **Checkbox** (`type: "checkbox"`)
```tsx
{ 
  key: "status", 
  label: "Status",
  icon: CheckSquare,
  type: "checkbox",
  options: [
    { id: "1", label: "Active" },
    { id: "0", label: "Inactive" }
  ],
  defaultOpen: true
}
```

### 3. **Select Dropdown** (`type: "select"`)
```tsx
{ 
  key: "sort_by", 
  label: "Sort By",
  icon: FilterIcon,
  type: "select",
  placeholder: "Select sort order",
  items: [
    { id: "newest", name: "Newest First" },
    { id: "oldest", name: "Oldest First" }
  ],
  defaultOpen: false
}
```

---

## 🔥 Behavior

### Auto-close
- ✅ Click outside panel
- ✅ Press Escape key
- ✅ Click X button in header
- ✅ Click Apply button

### URL Sync
- All filters sync with URL query parameters
- Back/forward navigation works
- Shareable filtered URLs

### Callbacks
```tsx
<Filter 
  sections={filterSections}
  onApply={() => {
    // Called when "Apply" button clicked
    // Panel closes automatically
    fetchData();
  }}
  onClear={() => {
    // Called when "Clear all" clicked
    // All filter params are already cleared
    fetchData();
  }}
  triggerButton={...}
/>
```

---

## 🌐 Translations

Uses your translation keys:
- `TITLES.filters` → Header and trigger button text
- `TITLES.apply` → Apply button
- `TITLES.clearAll` → Clear all button

Already added to both `en.ts` and `ar.ts`!

---

## 🎨 Styling & Position

### Panel Position
By default: `fixed right-4 top-20`

To customize position, modify in `Filter.tsx`:
```tsx
// Change position
className="fixed right-4 top-20 ..."  // Top-right
className="fixed left-4 top-20 ..."   // Top-left
className="fixed right-4 bottom-20 ..." // Bottom-right
```

### Panel Width
Default: `w-[320px]`

To change:
```tsx
className="... w-[400px] ..."  // Wider
className="... w-[280px] ..."  // Narrower
```

### Max Height
Default: `max-h-[calc(100vh-120px)]`

Adjusts automatically based on viewport height.

---

## 🚀 Integration with PageHeader

The `PageHeader` component now supports `rightActions` prop:

```tsx
<PageHeader
  title="categories"
  subtitle="categoryDesc"
  icon={Library}
  total={100}
  addHref="/categories/form"
  addLabel="category"
  path={[...]}
  rightActions={
    <Filter sections={filterSections} ... />
  }
/>
```

The filter button will appear next to the "Add" button in the header!

---

## 📝 Complete Example

```tsx
import { Filter, type FilterSection } from "../../components/Filter/Filter";
import { PageHeader } from "../../components/UI/PageHeader";
import { SlidersHorizontal, Search, CheckSquare, Calendar } from "lucide-react";

export default function ProductsPage() {
  const { t } = useTranslation();
  
  const filterSections: FilterSection[] = [
    { 
      key: "search", 
      label: "Search",
      icon: Search,
      type: "text",
      placeholder: "Search products...",
      defaultOpen: true
    },
    { 
      key: "categories", 
      label: "Categories",
      icon: CheckSquare,
      type: "checkbox",
      options: [
        { id: "1", label: "Fashion" },
        { id: "2", label: "Electronics" },
        { id: "3", label: "Home & Garden" }
      ],
      defaultOpen: true
    },
    { 
      key: "sort", 
      label: "Sort By",
      icon: Calendar,
      type: "select",
      placeholder: "Select order",
      items: [
        { id: "newest", name: "Newest" },
        { id: "oldest", name: "Oldest" }
      ],
      defaultOpen: false
    },
  ];
  
  const fetchData = async () => {
    // Your data fetching logic
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="products"
        subtitle="productDesc"
        icon={Package}
        total={150}
        addHref="/products/form"
        addLabel="product"
        path={[
          { label: "home", href: "/" },
          { label: "products" }
        ]}
        rightActions={
          <Filter 
            sections={filterSections} 
            onApply={fetchData} 
            onClear={fetchData}
            triggerButton={
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all shadow-sm"
              >
                <SlidersHorizontal size={18} />
                <span>{t("TITLES.filters")}</span>
              </button>
            }
          />
        }
      />
      
      {/* Your content */}
    </div>
  );
}
```

---

## ✨ Animations

The filter includes smooth animations:

1. **Backdrop**: Fade-in effect
2. **Panel**: Slide-in from right with scale
3. **Sections**: Smooth expand/collapse

All animations use CSS transitions and are hardware-accelerated!

---

## 🎉 Result

You now have a beautiful floating filter panel that:
- ✅ Opens on button click
- ✅ Floats in the top-right corner
- ✅ Has a backdrop overlay
- ✅ Closes on outside click or Escape
- ✅ Uses your color system
- ✅ Works in dark mode
- ✅ Has smooth animations
- ✅ Matches your image design!

Enjoy! 🚀
