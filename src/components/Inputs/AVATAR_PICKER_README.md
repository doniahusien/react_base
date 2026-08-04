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

### Option 2: Use DiceBear API (current implementation)
The component currently uses the DiceBear Avataaars style API to generate avatars.
You can customize this by:

1. **Change the style**: Replace `avataaars` with any other DiceBear style:
   - `adventurer`, `adventurer-neutral`, `avataaars`, `big-ears`, `big-smile`
   - `bottts`, `croodles`, `fun-emoji`, `icons`, `identicon`
   - `initials`, `lorelei`, `micah`, `miniavs`, `open-peeps`
   - `personas`, `pixel-art`, `thumbs`

2. **Change the seeds**: The `seed` parameter determines the avatar appearance.
   You can use names, words, or random strings.

Example with different style:
```typescript
const RECOMMENDED_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot2",
  // ...
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
