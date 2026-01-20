# BOLT Prompt: Add Phone Auto-Formatting to Wholesaler Modals

## Overview
Update the existing AddWholesalerModal (and EditWholesalerModal if it exists) to auto-format phone numbers as the user types.

**Format:** `(xxx) xxx-xxxx` - 10 digits only

---

## Changes Required

### 1. Add Phone Formatting Helper Functions

Add these at the top of the component file (after imports, before the component):

```tsx
// Phone formatting helpers
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limited = digits.slice(0, 10);
  
  // Format based on length
  if (limited.length === 0) return '';
  if (limited.length <= 3) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
};

const isValidPhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10;
};
```

### 2. Update the handleChange Function

Find the existing `handleChange` function and update it to handle phone formatting:

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  
  if (name === 'phone') {
    // Auto-format phone number as user types
    setFormData(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  // Clear error when user starts typing (if you have error state)
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};
```

### 3. Update Phone Validation

In the `validateForm` function, update the phone validation:

```tsx
// Replace existing phone validation with:
if (!formData.phone.trim()) {
  newErrors.phone = 'Phone is required';
} else if (!isValidPhone(formData.phone)) {
  newErrors.phone = 'Please enter a valid 10-digit phone number';
}
```

### 4. Update Phone Input Field

Make sure the phone input has:
- `type="tel"` 
- `placeholder="(555) 123-4567"`

```tsx
<input
  type="tel"
  name="phone"
  value={formData.phone}
  onChange={handleChange}
  placeholder="(555) 123-4567"
  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
    errors.phone ? 'border-red-500' : 'border-gray-300'
  }`}
/>
```

---

## Expected Behavior

| User Types | Field Shows |
|------------|-------------|
| `5` | `(5` |
| `55` | `(55` |
| `555` | `(555` |
| `5551` | `(555) 1` |
| `55512` | `(555) 12` |
| `555123` | `(555) 123` |
| `5551234` | `(555) 123-4` |
| `55512345` | `(555) 123-45` |
| `555123456` | `(555) 123-456` |
| `5551234567` | `(555) 123-4567` |
| `55512345678` | `(555) 123-4567` ← stops at 10 digits |

---

## Files to Update
1. `src/admin/components/AddWholesalerModal.tsx`
2. `src/admin/components/EditWholesalerModal.tsx` (if exists)
