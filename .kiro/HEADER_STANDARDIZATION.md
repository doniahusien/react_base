# Page Header Standardization

## Overview
All page headers across the application now use the same `PageHeader` component with conditional props to show/hide elements based on page type.

## Implementation

### PageHeader Component Props
Located in: `src/components/UI/PageHeader.tsx`

The component supports these optional props:
- `title` - Page title (required)
- `subtitle` - Page description (optional)
- `icon` - Icon component (optional)
- `total` - Total count for list pages (optional)
- `addHref` - Link for "Add" button (optional)
- `addLabel` - Label for "Add" button (optional)
- `path` - Breadcrumb path array (optional)
- `rightActions` - Custom action buttons (optional)
- `showHomeBreadcrumb` - Show home in breadcrumb (optional)
- `breadcrumbSeparator` - Breadcrumb separator style (optional)
- `breadcrumbVariant` - Breadcrumb variant style (optional)

## Page Types

### 1. List Pages (show-all)
**Example:** `src/routes/Users/show-all.tsx`

Uses all props:
```tsx
<PageHeader
  title="users"
  subtitle="userDesc"
  icon={Users}
  total={data.meta?.total ?? data.data.length}
  addHref="/users/form"
  addLabel="user"
  path={[
    { label: "home", href: "/", icon: LayoutDashboard },
    { label: "users", icon: Users }
  ]}
/>
<Filter items={filterItems} />
```

**Features:**
- Shows page title with icon
- Shows subtitle/description
- Displays total count
- Shows "Add New" button
- Includes breadcrumb navigation
- Separate Filter component below header

### 2. Detail Pages (show)
**Example:** `src/routes/Users/show.tsx`

Uses minimal props with custom rightActions:
```tsx
<PageHeader
  title="userDetails"
  icon={UserCircle}
  path={[
    { label: "dashboard", href: "/", icon: LayoutDashboard },
    { label: "users", href: "/users", icon: Users },
    { label: user.full_name, icon: UserCircle }
  ]}
  rightActions={
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto">
      {/* Avatar and user info */}
      {/* Edit and Delete buttons */}
    </div>
  }
/>
```

**Features:**
- Shows page title with icon
- No subtitle (hidden automatically)
- No total count (hidden automatically)
- No "Add" button (hidden automatically)
- Includes breadcrumb with entity name
- Custom actions area for entity-specific content (avatar, status badges, edit/delete buttons)

### 3. Form Pages (form - create/edit)
**Example:** `src/routes/Users/form.tsx`

Uses basic props only:
```tsx
<PageHeader
  title={editing ? "editUser" : "addUser"}
  subtitle={editing ? "updateUserInfo" : "createNewUser"}
  icon={editing ? User : Users}
  path={[
    { label: "dashboard", href: "/", icon: LayoutDashboard },
    { label: "users", href: "/users", icon: Users },
    { label: editing ? "edit" : "add" }
  ]}
/>
```

**Features:**
- Shows dynamic title based on edit/create mode
- Shows descriptive subtitle
- Shows appropriate icon
- Includes breadcrumb navigation
- No total count (hidden automatically)
- No "Add" button (hidden automatically)
- No filter component

## Updated Files

### Users Module
- ✅ `src/routes/Users/show.tsx` - Now uses PageHeader with custom rightActions
- ✅ `src/routes/Users/form.tsx` - Now uses PageHeader with basic props
- `src/routes/Users/show-all.tsx` - Already using PageHeader (no changes)

### Categories Module
- ✅ `src/routes/Categories/show.tsx` - Now uses PageHeader with custom rightActions
- ✅ `src/routes/Categories/form.tsx` - Now uses PageHeader with basic props
- `src/routes/Categories/show-all.tsx` - Already using PageHeader (no changes)

### Cities Module
- ✅ `src/routes/Cities/form.tsx` - Now uses PageHeader with basic props
- `src/routes/Cities/show-all.tsx` - Already using PageHeader (no changes)

### Countries Module
- ✅ `src/routes/Countries/form.tsx` - Now uses PageHeader with basic props
- `src/routes/Countries/show-all.tsx` - Already using PageHeader (no changes)

## Benefits

1. **Consistency** - All pages have the same visual header style
2. **Maintainability** - One component to update for header changes
3. **Flexibility** - Optional props allow customization per page type
4. **Reusability** - Same component works for list, detail, and form pages
5. **Clean Code** - Removed duplicate header implementations across pages

## Component Behavior

The `PageHeader` component automatically:
- Hides elements when props are not provided (total, addHref, subtitle)
- Maintains consistent styling across all pages
- Provides responsive layout for mobile and desktop
- Includes beautiful gradient background with wave SVG
- Supports custom actions via rightActions prop
- Integrates BannerBreadcrumb component for navigation

## Migration Pattern

When creating new pages, use this pattern:

1. **List page**: Include total, addHref, addLabel props + separate Filter component
2. **Detail page**: Basic props + custom rightActions for entity info and actions
3. **Form page**: Basic props with dynamic title/subtitle based on edit mode
