# TanStack Table Integration

## Overview

The Table component uses **TanStack Table v8's native features** following official documentation patterns.

## ✅ Correct Version: v8

**Your project uses `@tanstack/react-table` v8.20.5**, which is the stable, production-ready version.

> ⚠️ **Note**: The example you shared is from **v9 beta** which has a completely different API. Our implementation follows **v8 documentation**.

## Column Visibility: Official v8 Pattern

### Implementation (Based on v8 Docs)

```tsx
// ✅ Official TanStack Table v8 API
const columns = table.getAllColumns().filter((col) => col.id !== "select");

// Toggle all columns
<input
  type="checkbox"
  checked={table.getIsAllColumnsVisible()}
  onChange={table.getToggleAllColumnsVisibilityHandler()}
/>

// Toggle individual column
<input
  type="checkbox"
  checked={column.getIsVisible()}
  onChange={column.getToggleVisibilityHandler()}
/>
```

This matches the [official v8 Column Visibility example](https://tanstack.com/table/v8/docs/examples/react/column-visibility).

## TanStack Table v8 Features Used

### 1. **Column Visibility State**
```tsx
const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ 
  select: true 
});

const table = useReactTable({
  state: {
    columnVisibility,
  },
  onColumnVisibilityChange: setColumnVisibility,
});
```

### 2. **Column Visibility API Methods**

| Method | Purpose | Example |
|--------|---------|---------|
| `table.getAllColumns()` | Get all column instances | Filter out select column |
| `table.getIsAllColumnsVisible()` | Check if all visible | Toggle all checkbox state |
| `table.getToggleAllColumnsVisibilityHandler()` | Toggle all handler | Master checkbox |
| `table.toggleAllColumnsVisible(boolean)` | Set all visibility | Select/Deselect all buttons |
| `column.getIsVisible()` | Check column visibility | Individual checkbox state |
| `column.getToggleVisibilityHandler()` | Toggle column handler | Individual checkbox |
| `column.toggleVisibility()` | Programmatic toggle | Custom logic |

### 3. **Other TanStack v8 Features Used**

- ✅ **Row Selection** - `rowSelection` state + `getToggleSelectedHandler()`
- ✅ **Sorting** - `sorting` state + `getToggleSortingHandler()`
- ✅ **Column Resizing** - `columnSizing` state + `getResizeHandler()`
- ✅ **Filtering** - `getFilteredRowModel()`
- ✅ **Pagination** - `getPaginationRowModel()` (manual mode)

## v8 vs v9 Comparison

| Feature | v8 (Production) | v9 (Beta) |
|---------|-----------------|-----------|
| **Import** | `useReactTable` | `useTable` + `tableFeatures` |
| **Setup** | Single function | Feature composition |
| **Render** | `flexRender()` | `<table.FlexRender />` |
| **Features** | Built-in | Opt-in via `tableFeatures()` |
| **Status** | ✅ Stable | ⚠️ Beta (breaking changes) |

### v8 Example (Our Implementation)
```tsx
import { useReactTable, flexRender } from '@tanstack/react-table'

const table = useReactTable({
  data,
  columns,
  state: { columnVisibility },
  onColumnVisibilityChange: setColumnVisibility,
})

{flexRender(cell.column.columnDef.cell, cell.getContext())}
```

### v9 Example (From Docs You Shared)
```tsx
import { useTable, tableFeatures, columnVisibilityFeature } from '@tanstack/react-table'

const features = tableFeatures({ columnVisibilityFeature })

const table = useTable({ features, columns, data })

<table.FlexRender cell={cell} />
```

## Our Implementation Features

### ColumnVisibilityMenu Component

**Features Implemented:**
1. ✅ **Toggle All** - Master checkbox using `table.getToggleAllColumnsVisibilityHandler()`
2. ✅ **Individual Toggles** - Per-column checkboxes using `column.getToggleVisibilityHandler()`
3. ✅ **Visibility State** - Visual feedback using `column.getIsVisible()`
4. ✅ **Select All/Deselect All** - Buttons using `table.toggleAllColumnsVisible()`
5. ✅ **Exclude Select Column** - Filter out checkbox column from visibility controls

**Official v8 Reference:**
- [Column Visibility Guide](https://tanstack.com/table/v8/docs/guide/column-visibility)
- [Column Visibility Example](https://tanstack.com/table/v8/docs/examples/react/column-visibility)
- [API Reference](https://tanstack.com/table/v8/docs/api/core/table)

## Migration Path (Future)

When upgrading to v9 (when stable), you'll need to:

1. Install v9: `npm install @tanstack/react-table@next`
2. Update imports:
   ```tsx
   import { useTable, tableFeatures, columnVisibilityFeature } from '@tanstack/react-table'
   ```
3. Update table creation:
   ```tsx
   const features = tableFeatures({ columnVisibilityFeature })
   const table = useTable({ features, columns, data })
   ```
4. Update rendering:
   ```tsx
   <table.FlexRender cell={cell} />
   ```

**But for now, stick with v8 - it's stable and production-ready!** ✅
