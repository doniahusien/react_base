# Table Component - Modular Architecture

This directory contains the refactored Table component split into focused, maintainable modules.

## Structure

```
Table/
├── index.tsx                 # Main UITable component (orchestrator)
├── types.ts                  # TypeScript interfaces and types
├── utils.ts                  # Helper functions
├── SkeletonRow.tsx          # Loading skeleton UI
├── Pagination.tsx           # Pagination controls
├── TableToolbar.tsx         # Toolbar with filters, view switchers, column modifier
├── TableView.tsx            # Table view rendering
├── GridView.tsx             # Grid view rendering
├── QuickViewModal.tsx       # Quick view modal overlay
└── README.md                # This file
```

## Components

### `UITable` (index.tsx)
Main orchestrator component that manages state and coordinates all sub-components.

**Responsibilities:**
- State management (sorting, pagination, selection, visibility)
- TanStack Table configuration
- Responsive view switching
- URL-based pagination handling

### `TableToolbar`
Top toolbar with controls and metadata display.

**Features:**
- Title and total count badge
- Selected items count with bulk delete
- Column visibility modifier
- View mode switcher (table/grid)
- Grid column count selector
- Custom filter components

### `TableView`
Traditional table layout with advanced features.

**Features:**
- Sortable columns
- Resizable columns
- Row selection with checkboxes
- Sticky action columns
- Loading skeletons
- Empty state
- Quick view button

### `GridView`
Card-based grid layout for responsive displays.

**Features:**
- Configurable grid columns (1-4)
- Card-based item display
- Row selection
- Loading skeletons
- Empty state
- Actions footer

### `Pagination`
Smart pagination with page number controls.

**Features:**
- Ellipsis for large page ranges
- Current page highlighting
- Previous/Next navigation
- Shows item range (e.g., "1-10 of 100")

### `QuickViewModal`
Modal overlay for quick record inspection.

**Features:**
- Backdrop blur
- Custom content rendering via `renderQuickView` prop
- Default key-value display
- Accessible close button

### `SkeletonRow`
Loading state placeholder.

### Utils & Types
- **utils.ts**: Helper functions (dig, pageFromUrl, setPageUrl, getDefaultColumnSize)
- **types.ts**: All TypeScript interfaces and type definitions

## Usage

```tsx
import { UITable } from "../../components/UI/Table";
import type { TableColumn } from "../../components/UI/Table";

const columns: TableColumn[] = [
  { field: "name", header: "Name", sortable: true },
  { field: "email", header: "Email", sortable: true },
  { field: "actions", header: "Actions" },
];

<UITable
  data={data}
  columns={columns}
  title="users"
  loading={loading}
  renderCell={renderCell}
  renderQuickView={renderQuickView}
  filters={<Filter items={filterItems} />}
/>
```

## Benefits of Refactoring

1. **Separation of Concerns**: Each component has a single, clear responsibility
2. **Maintainability**: Easier to locate and fix bugs
3. **Testability**: Individual components can be tested in isolation
4. **Reusability**: Sub-components can be used independently
5. **Readability**: Reduced complexity from 654 lines to ~200 lines per file
6. **Type Safety**: Centralized types in types.ts
7. **Performance**: Easier to optimize individual components

## Migration Notes

The refactored component maintains 100% backward compatibility. All existing code using `UITable` will continue to work without changes.
