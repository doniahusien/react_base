# Inline Add Row Component 

## ✅ Feature Added

A beautiful inline row adding component that allows users to add new records directly in the table view without navigating to a separate form page!

## 🎨 Features

1. **Expandable Interface** - Starts as a compact "+ Add" button
2. **Inline Form** - Expands to show all fields in a grid layout
3. **Real-time Validation** - Shows errors as user types
4. **File Upload Support** - Handles file inputs (like flag images)
5. **Responsive Grid** - Adapts to screen size (2, 3, or 4 columns)
6. **Smooth Animations** - Elegant expand/collapse with scale effects
7. **Loading States** - Disabled inputs and buttons during save
8. **Visual Feedback** - Gradient border and backgrounds

---

## 📍 Where to See It

Navigate to **`/countries`** - You'll see the inline add row component right below the page header!

---

## 🔧 How to Use

### Basic Implementation

```tsx
import { InlineAddRow } from "../../components/UI/InlineAddRow";

// Define your fields
const inlineAddFields = [
  { 
    key: "name", 
    label: "Name", 
    type: "text", 
    placeholder: "Enter name", 
    required: true 
  },
  { 
    key: "email", 
    label: "Email", 
    type: "text", 
    placeholder: "Enter email", 
    required: true 
  },
  { 
    key: "age", 
    label: "Age", 
    type: "number", 
    placeholder: "Enter age" 
  },
];

// Handle save
const handleInlineAdd = async (formData: Record<string, any>) => {
  try {
    await api.post("your-endpoint", formData);
    showToast({ type: "success", message: "Created successfully" });
    fetchData(); // Refresh your table
  } catch (error) {
    showToast({ type: "error", message: "Create failed" });
    throw error; // Re-throw to show field errors
  }
};

// Use in your component
<InlineAddRow fields={inlineAddFields} onSave={handleInlineAdd} />
```

---

## 📊 Field Types

### Text Input
```tsx
{ 
  key: "username", 
  label: "Username", 
  type: "text", 
  placeholder: "Enter username", 
  required: true 
}
```

### Number Input
```tsx
{ 
  key: "phone_code", 
  label: "Phone Code", 
  type: "number", 
  placeholder: "e.g. 966", 
  required: true 
}
```

### File Upload
```tsx
{ 
  key: "avatar", 
  label: "Avatar", 
  type: "file", 
  required: false 
}
```

---

## 🎯 Props

### `fields`
Array of field definitions:
- `key`: Field name (used in formData)
- `label`: Display label
- `type`: "text" | "number" | "file"
- `placeholder`: Input placeholder (optional)
- `required`: Whether field is required (optional)

### `onSave`
Async function that receives formData and handles the save:
```tsx
onSave={async (formData) => {
  // formData is Record<string, any>
  // e.g. { name: "John", email: "john@example.com" }
  await api.post("endpoint", formData);
}}
```

### `onCancel` (optional)
Called when user cancels:
```tsx
onCancel={() => {
  console.log("User cancelled");
}}
```

---

## 📝 Validation

### Frontend Validation
- Required fields checked automatically
- Shows error message below field
- Prevents save if validation fails

### Backend Validation
The component handles backend validation errors:
```tsx
// If your API returns errors in this format:
{
  "errors": {
    "name": "The name field is required",
    "email": "The email must be a valid email address"
  }
}

// The component will automatically display them under each field
```

---

## 🎨 Styling

The component uses your theme colors:
- `border-primary` - Active border color
- `bg-primary` - Button and active states
- `text-primary` - Text highlights
- Smooth animations and transitions
- Responsive grid layout

---

## 💡 Example: Countries Table

```tsx
const inlineAddFields = [
  { key: "name_en", label: "Name (English)", type: "text", required: true },
  { key: "name_ar", label: "Name (Arabic)", type: "text", required: true },
  { key: "phone_code", label: "Phone Code", type: "number", required: true },
  { key: "phone_length", label: "Phone Length", type: "number", required: true },
  { key: "currency_en", label: "Currency (English)", type: "text" },
  { key: "currency_ar", label: "Currency (Arabic)", type: "text" },
  { key: "estimated_arrival_days", label: "Arrival Days", type: "number" },
  { key: "flag", label: "Flag", type: "file" },
];

const handleInlineAdd = async (formData: Record<string, any>) => {
  const payload = new FormData();
  
  // Handle nested data structure
  payload.append("name[en]", formData.name_en);
  payload.append("name[ar]", formData.name_ar);
  payload.append("phone_code", formData.phone_code);
  
  // Handle file
  if (formData.flag) {
    payload.append("flag", formData.flag);
  }
  
  await api.post("countries", payload, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  
  fetchData();
};

<InlineAddRow fields={inlineAddFields} onSave={handleInlineAdd} />
```

---

## 🚀 User Flow

1. User sees "+ Add Quick Add" button
2. Clicks to expand inline form
3. Fills in required fields (marked with red *)
4. Optional fields can be left empty
5. Clicks "Save" → Loading state shown
6. Success → Form collapses, table refreshes
7. Error → Error messages shown under fields
8. User can click "Cancel" anytime to close form

---

## ✨ Visual Features

- **Gradient border** when expanded (primary color)
- **Animated entrance** - smooth expand animation
- **Hover effects** on buttons (scale up)
- **Active states** on form inputs
- **File upload styling** - Beautiful file input
- **Responsive grid** - Adjusts columns based on screen size
- **Loading states** - Disabled during save

---

## 🎉 Benefits

1. **Faster workflow** - No page navigation needed
2. **Visual context** - See table while adding
3. **Reduced clicks** - Add directly from list view
4. **Better UX** - Smooth animations and feedback
5. **Flexible** - Works with any API endpoint
6. **Reusable** - Use in any table/list page

Enjoy your new inline add functionality! 🚀
