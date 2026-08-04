# Component Responsibility Map

## Visual Component Tree

```
Drawer (Main Orchestrator)
│
├── [Horizontal Mode]
│   └── DrawerHorizontalLayout
│       └── Navigation Links
│
├── [Two-Column Mode]
│   └── DrawerTwoColumnLayout
│       ├── Group Icons Sidebar
│       └── Active Group Items
│
├── [Standard/Mobile Mode]
│   └── sidebarContent()
│       ├── DrawerHeader
│       │   ├── Logo Badge
│       │   └── Search Icon (when collapsed)
│       │
│       ├── DrawerSearch (when expanded)
│       │   ├── Search Input
│       │   └── Keyboard Shortcut Hint
│       │
│       ├── DrawerNavContent
│       │   ├── Pinned Section
│       │   │   └── DrawerNavItem (sortable)
│       │   │       └── SortablePinnedItem wrapper
│       │   │
│       │   └── Navigation Groups
│       │       └── DrawerNavGroup
│       │           └── DrawerNavItem
│       │               └── DrawerNavItem (children/submenu)
│       │
│       └── DrawerUserProfile
│           ├── User Avatar (optional)
│           └── Logout Button
│
└── DrawerCommandPalette (Global Modal)
    ├── Search Input
    ├── Go To Section
    ├── System Commands
    └── Preferences
```

## Responsibility Matrix

| Component | Responsibility | State | Props | Dependencies |
|-----------|---------------|-------|-------|--------------|
| **Drawer.tsx** | Main orchestrator, state management, keyboard shortcuts | Local + Store | None | All sub-components |
| **DrawerHeader** | Logo, search trigger | None | collapsed, isMobileDrawer, shortcutLabel, onSearchClick | Tooltip |
| **DrawerSearch** | Inline search input | None | searchQuery, setSearchQuery, searchResults, shortcutLabel, onModalClick | - |
| **DrawerNavItem** | Individual nav item with pin | None | link, pathname, collapsed, openSubMenu, togglePinItem, pinnedItemsV2, etc. | Tooltip, Link, SortablePinnedItem |
| **DrawerNavGroup** | Group of nav items | None | group, pathname, collapsed, togglePinGroup, pinnedItemsV2, etc. | DrawerNavItem |
| **DrawerNavContent** | Navigation area with pinned section | None | groups, pinnedItemsV2, searchQuery, pathname, collapsed, etc. | DrawerNavItem, DrawerNavGroup, DndContext |
| **DrawerUserProfile** | User section with logout | None | user, collapsed, isMobileDrawer, clearAuth, onMobileClose | Tooltip |
| **DrawerCommandPalette** | Command palette modal | None | isOpen, searchQuery, searchResults, selectedIndex, goToItems, etc. | Link, useNavigate |
| **DrawerHorizontalLayout** | Horizontal nav bar | None | groups, pathname, locale | Link |
| **DrawerTwoColumnLayout** | Two-column sidebar | None | groups, activeGroup, activeNavGroupKey, pathname, etc. | DrawerNavItem, Tooltip |
| **SortablePinnedItem** | Drag-and-drop wrapper | DnD | id, children, disabled | useSortable from @dnd-kit |
| **utils.ts** | Helper functions | - | - | - |
| **types.ts** | Type definitions | - | - | - |

## Data Flow

```
User Interaction
      ↓
   Drawer.tsx (State Management)
      ↓
   ├── setSidebarOpen()
   ├── setSearchQuery()
   ├── setOpenSubMenu()
   ├── togglePinItem()
   ├── togglePinGroup()
   ├── reorderPinnedItems()
   └── setActiveNavGroupKey()
      ↓
   Sub-components (UI Rendering)
      ↓
   Callbacks back to Drawer
```

## Import Dependencies

### External Dependencies
- `react-router-dom` - Link, useLocation, useNavigate
- `@heroicons/react` - Icon components
- `react-i18next` - useTranslation
- `@dnd-kit/core` - Drag and drop
- `@dnd-kit/sortable` - Sortable functionality

### Internal Dependencies
- `../../store` - useAppStore
- `../../stores/auth` - useAuthStore
- `../../types/sidebar` - NavItem, NavGroup
- `../Tooltip` - Tooltip component

## State Management

### Global State (from Store)
- `sidebarCollapsed` - Sidebar collapse state
- `sidebarMode` - Navigation mode (standard/horizontal/two-column)
- `sidebarOpen` - Mobile sidebar open state
- `pinnedItemsV2` - Pinned navigation items
- `activeNavGroupKey` - Active group in two-column mode
- `lang` - Current language
- `user` - Current user data

### Local State (in Drawer.tsx)
- `openSubMenu` - Currently open submenu
- `searchQuery` - Search input value
- `searchModalOpen` - Command palette visibility
- `selectedIndex` - Selected item in command palette
- `chordBuffer` - Keyboard shortcut buffer

## Event Handlers

| Handler | Purpose | Location |
|---------|---------|----------|
| `setSidebarOpen()` | Toggle mobile drawer | Drawer.tsx |
| `setSearchModalOpen()` | Toggle command palette | Drawer.tsx |
| `setOpenSubMenu()` | Toggle submenu | Drawer.tsx |
| `togglePinItem()` | Pin/unpin single item | Store |
| `togglePinGroup()` | Pin/unpin all group items | Store |
| `reorderPinnedItems()` | Reorder pinned items | Store |
| `setActiveNavGroupKey()` | Change active group | Store |
| `clearAuth()` | Logout user | Auth Store |

## File Size Comparison

| File | Lines | Purpose |
|------|-------|---------|
| **Before (Drawer.tsx)** | **841** | **Everything** |
| **After Total** | **1,593** | **Better organized** |
| Drawer.tsx | 448 | Main orchestrator |
| DrawerCommandPalette.tsx | 297 | Command palette |
| DrawerNavItem.tsx | 179 | Nav item |
| DrawerNavContent.tsx | 166 | Nav content |
| DrawerTwoColumnLayout.tsx | 148 | Two-column layout |
| DrawerUserProfile.tsx | 90 | User profile |
| DrawerNavGroup.tsx | 89 | Nav group |
| DrawerHeader.tsx | 49 | Header |
| DrawerHorizontalLayout.tsx | 49 | Horizontal layout |
| DrawerSearch.tsx | 41 | Search input |
| SortablePinnedItem.tsx | 36 | Sortable wrapper |
| index.tsx | 1 | Barrel export |

**Note:** While the total lines increased (due to imports, exports, and interfaces in each file), the average file size is now ~145 lines vs 841 lines, making each file much more manageable.
