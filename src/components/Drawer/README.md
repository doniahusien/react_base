# Drawer Component - Refactored Structure

This folder contains the refactored Drawer component, split into smaller, focused, and maintainable components.

## Structure

```
Drawer/
├── Drawer.tsx                    # Main orchestrator component
├── index.tsx                     # Barrel export
├── types.ts                      # TypeScript interfaces and types
├── utils.ts                      # Utility functions
├── DrawerHeader.tsx              # Logo and search trigger
├── DrawerSearch.tsx              # Inline search input
├── DrawerNavItem.tsx             # Individual navigation items with pin functionality
├── DrawerNavGroup.tsx            # Navigation group with multiple items
├── DrawerNavContent.tsx          # Navigation content with pinned section
├── DrawerUserProfile.tsx         # User profile section with logout
├── DrawerCommandPalette.tsx      # Command palette modal (Cmd/Ctrl+K)
├── DrawerHorizontalLayout.tsx    # Horizontal navigation layout
├── DrawerTwoColumnLayout.tsx     # Two-column navigation layout
└── SortablePinnedItem.tsx        # Drag-and-drop wrapper for pinned items
```

## Components Overview

### Main Component
- **Drawer.tsx** - The main component that orchestrates all sub-components and handles state management

### Layout Components
- **DrawerHorizontalLayout.tsx** - Renders horizontal navigation bar
- **DrawerTwoColumnLayout.tsx** - Renders two-column sidebar with group icons
- Standard sidebar layout - Rendered directly in Drawer.tsx

### UI Components
- **DrawerHeader.tsx** - Contains logo and search icon (when collapsed)
- **DrawerSearch.tsx** - Inline search input with keyboard shortcut hint
- **DrawerNavContent.tsx** - Main navigation area with pinned and grouped items
- **DrawerNavItem.tsx** - Reusable navigation item with:
  - Active state styling
  - Icon support
  - Children/submenu support
  - Pin/unpin functionality
  - Tooltip when collapsed
- **DrawerNavGroup.tsx** - Navigation group with:
  - Group label
  - Pin all/unpin all functionality
  - Filter out pinned items
- **DrawerUserProfile.tsx** - User profile section with logout button
- **DrawerCommandPalette.tsx** - Modal command palette with:
  - Keyboard navigation (Arrow keys, Enter)
  - Search functionality
  - Quick navigation shortcuts
  - System commands
  - Preferences

### Supporting Components
- **SortablePinnedItem.tsx** - Drag-and-drop wrapper using @dnd-kit

### Utilities
- **types.ts** - All TypeScript interfaces and prop types
- **utils.ts** - Helper functions:
  - `getTextValue()` - Extract text from React nodes
  - `isItemActive()` - Check if route is active
  - `makeKeyHint()` - Generate keyboard shortcut hints
  - `getIsMac()` - Detect macOS
  - `getShortcutLabel()` - Get platform-specific shortcuts

## Features

### Pin System
- Pin/unpin individual items
- Pin/unpin entire groups
- Drag to reorder pinned items
- Pinned items persist via store

### Keyboard Navigation
- **Cmd/Ctrl+K** - Open command palette
- **Arrow keys** - Navigate command palette
- **Enter** - Execute selected command
- **Escape** - Close modals or clear search
- **Cmd/Ctrl+[two letters]** - Quick shortcuts (e.g., DA for Dashboard)

### Search
- Inline search in sidebar
- Modal search with command palette
- Real-time filtering
- Keyboard-first interaction

### Responsive Design
- Mobile drawer with overlay
- Collapsed sidebar mode
- Horizontal navigation mode
- Two-column navigation mode

## Usage

```tsx
import { Drawer } from './components/Drawer';

// The component is fully self-contained
<Drawer />
```

## Benefits of Refactoring

1. **Maintainability** - Each component has a single responsibility
2. **Testability** - Smaller components are easier to test
3. **Reusability** - Components can be reused in different contexts
4. **Readability** - Easier to understand and navigate code
5. **Performance** - Better tree-shaking and code splitting
6. **Type Safety** - Centralized types for better IntelliSense
7. **Collaboration** - Multiple developers can work on different components

## Migration

The old `Drawer.tsx` file has been replaced with a simple re-export for backward compatibility:

```tsx
export { Drawer } from "./Drawer/Drawer";
```

All existing imports will continue to work without changes.
