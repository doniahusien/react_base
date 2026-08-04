# Avatar Picker Component

## Overview
The `AvatarPicker` component provides users with two ways to set their profile image:
1. **Upload Mode**: Upload a custom image file (same as the original BaseFilesInput)
2. **Preset Mode**: Choose from a collection of recommended avatar images

## Features
- Toggle between upload and preset modes
- Grid of recommended avatars to choose from
- Preview selected preset avatar
- All existing upload functionality preserved
- Seamless integration with existing forms
- Fully responsive design
- Support for both English and Arabic translations

## Usage

```tsx
import { AvatarPicker } from "../../components/Inputs/AvatarPicker";

<AvatarPicker
  name="image"
  label={t("PROFILE.profilePhoto")}
  accept="image/*"
  attachment
  model="users"
  value={imageValue}
  onChange={(v) => setImageFile(v)}
  onLoadingChange={setImageLoading}
/>
```

## Customizing Recommended Avatars

The recommended avatars are defined in the `RECOMMENDED_AVATARS` array at the top of the `AvatarPicker.tsx` file.

### What Makes a Good Preset Avatar?

**Quality Characteristics:**
1. **Professional Appearance** - Clean, simple designs suitable for business contexts
2. **Diversity** - Variety of styles, colors, and representations to suit different preferences
3. **Recognizability** - Each avatar is distinct enough for users to remember their choice
4. **Scalability** - Works well at both small (32px profile thumbnails) and large (200px previews) sizes
5. **Fast Loading** - SVG format for crisp rendering and small file size
6. **Consistent Style** - All avatars follow cohesive design patterns
7. **Inclusive** - Gender-neutral options and diverse representations

**Current Implementation:**
The default avatars use DiceBear's high-quality styles:
- **Personas** - Professional, diverse business personas
- **Adventurer** - Friendly, approachable character designs
- **Lorelei** - Elegant, modern illustrated style
- **Micah** - Clean, minimalist professional portraits
- **Fun Emoji** - Universal, friendly emoji-style avatars

All use soft background colors for better visual appeal.

### Option 1: Use your own hosted images
Replace the URLs in the array with your own image URLs:

```typescript
const RECOMMENDED_AVATARS = [
  "https://yourdomain.com/avatars/avatar1.png",
  "https://yourdomain.com/avatars/avatar2.png",
  "https://yourdomain.com/avatars/avatar3.png",
  // ... add as many as you want
];
```

### Option 2: Use DiceBear API (current implementation - RECOMMENDED)
The component currently uses high-quality DiceBear avatar styles with optimized parameters.

**Why DiceBear is Good:**
- ✅ SVG format (scalable, small file size)
- ✅ Consistent, professional design
- ✅ Diverse representation
- ✅ Free and reliable API
- ✅ No storage needed on your server

**Available Professional Styles:**
- `personas` - Diverse business personas (RECOMMENDED)
- `adventurer` / `adventurer-neutral` - Friendly characters
- `lorelei` - Elegant illustrations
- `micah` - Clean minimalist portraits
- `fun-emoji` - Universal emoji style
- `initials` - Letter-based avatars
- `thumbs` - Thumbs up style icons

**Customization Example:**
```typescript
const RECOMMENDED_AVATARS = [
  // Add background colors for better appearance
  "https://api.dicebear.com/7.x/personas/svg?seed=User1&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/personas/svg?seed=User2&backgroundColor=c0aede",
  
  // Mix different styles for variety
  "https://api.dicebear.com/7.x/adventurer/svg?seed=User3&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=User4&backgroundColor=d1d4f9",
];
```

### Option 3: Use local images
Store images in your `public` folder and reference them:

```typescript
const RECOMMENDED_AVATARS = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
];
```

## Implementation Details

The component wraps the existing `BaseFilesInput` and adds:
- Mode toggle buttons (Upload / Choose Avatar)
- Grid display of preset avatars
- Preview of selected preset
- Proper state management to handle both modes

When a preset avatar is selected, it's converted to the same format as uploaded files,
ensuring compatibility with the existing form submission logic.

## Translation Keys

Make sure these keys exist in your translation files:

```typescript
// English (en.ts)
LABELS: {
  uploadImage: "Upload",
  chooseAvatar: "Choose Avatar",
  recommendedAvatars: "Choose a recommended avatar",
}
BUTTONS: {
  changeAvatar: "Change",
}
MESSAGES: {
  avatarSelected: "Avatar Selected",
}

// Arabic (ar.ts)
LABELS: {
  uploadImage: "رفع الصورة",
  chooseAvatar: "اختر صورة رمزية",
  recommendedAvatars: "اختر صورة رمزية موصى بها",
}
BUTTONS: {
  changeAvatar: "تغيير",
}
MESSAGES: {
  avatarSelected: "تم اختيار الصورة الرمزية",
}
```

## Technical Notes

- The component maintains backward compatibility with `BaseFilesInput`
- Preset avatars are identified with an `id` prefix of `preset-`
- The avatar URL is stored in the `str` property of the file output
- Upload functionality remains unchanged from the original implementation
