# BOLT Prompt: Wholesaler Actions Dropdown & Edit Modal

## Overview
Replace the "View Deals" text link with an Actions dropdown menu that includes multiple options, and add an Edit Wholesaler modal.

---

## Task 1: Create Edit Wholesaler Modal

### New Component: `src/admin/components/EditWholesalerModal.tsx`

Create a modal for editing wholesaler details (similar to AddWholesalerModal but pre-populated):

```tsx
import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../context/ToastContext';
import { Wholesaler } from '../../types';

interface EditWholesalerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  wholesaler: Wholesaler | null;
}

export const EditWholesalerModal = ({ isOpen, onClose, onSuccess, wholesaler }: EditWholesalerModalProps) => {
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when wholesaler changes
  useEffect(() => {
    if (wholesaler) {
      setFormData({
        name: wholesaler.name || '',
        email: wholesaler.email || '',
        phone: wholesaler.phone || '',
        company_name: wholesaler.company_name || '',
        notes: wholesaler.notes || '',
      });
    }
  }, [wholesaler]);

  if (!isOpen || !wholesaler) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('wholesalers')
        .update({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          company_name: formData.company_name.trim() || null,
          notes: formData.notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wholesaler.id);
      
      if (error) {
        if (error.code === '23505') {
          showError('A wholesaler with this email already exists');
        } else {
          throw error;
        }
        return;
      }
      
      success('Wholesaler updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update wholesaler');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7CB342] flex items-center justify-center text-white font-bold">
              {wholesaler.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Edit Wholesaler</h3>
              <p className="text-xs text-gray-500">{wholesaler.total_deals} deals</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="ABC Investments LLC"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any notes about this wholesaler..."
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## Task 2: Create Actions Dropdown Component

### New Component: `src/admin/components/WholesalerActionsDropdown.tsx`

Create a dropdown menu for wholesaler actions:

```tsx
import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Pencil, ExternalLink } from 'lucide-react';

interface WholesalerActionsDropdownProps {
  onViewDeals: () => void;
  onEditProfile: () => void;
}

export const WholesalerActionsDropdown = ({ onViewDeals, onEditProfile }: WholesalerActionsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Actions"
      >
        <MoreHorizontal size={20} className="text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onViewDeals);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} className="text-[#7CB342]" />
            View Deals
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onEditProfile);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <Pencil size={16} className="text-blue-600" />
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Task 3: Update Wholesalers Page

### Modify: `src/admin/pages/Wholesalers.tsx`

Update the Wholesalers page to use the new dropdown and edit modal.

**Add imports:**
```tsx
import { EditWholesalerModal } from '../components/EditWholesalerModal';
import { WholesalerActionsDropdown } from '../components/WholesalerActionsDropdown';
```

**Add state for edit modal:**
```tsx
const [showEditModal, setShowEditModal] = useState(false);
const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
```

**Add handler for edit:**
```tsx
const handleEditWholesaler = (wholesaler: Wholesaler) => {
  setSelectedWholesaler(wholesaler);
  setShowEditModal(true);
};

const handleEditSuccess = () => {
  refetch();
  setShowEditModal(false);
  setSelectedWholesaler(null);
};
```

**Replace the Actions column content in the desktop table:**

Change from:
```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleViewDeals(wholesaler.id);
      }}
      className="text-[#7CB342] hover:text-[#689F38] text-sm font-medium"
    >
      View Deals
    </button>
    {expandedId === wholesaler.id ? (
      <ChevronUp size={16} className="text-gray-400" />
    ) : (
      <ChevronDown size={16} className="text-gray-400" />
    )}
  </div>
</td>
```

To:
```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    <WholesalerActionsDropdown
      onViewDeals={() => handleViewDeals(wholesaler.id)}
      onEditProfile={() => handleEditWholesaler(wholesaler)}
    />
    {expandedId === wholesaler.id ? (
      <ChevronUp size={16} className="text-gray-400" />
    ) : (
      <ChevronDown size={16} className="text-gray-400" />
    )}
  </div>
</td>
```

**Update the mobile card view to include an actions dropdown:**

In the mobile card section, add the actions dropdown. Replace the "View Deals →" button section with:

```tsx
<div className="flex items-center justify-between mt-3">
  <span className="text-sm text-gray-600">
    <span className="font-semibold text-[#7CB342]">{wholesaler.total_deals}</span> deals
  </span>
  <WholesalerActionsDropdown
    onViewDeals={() => handleViewDeals(wholesaler.id)}
    onEditProfile={() => handleEditWholesaler(wholesaler)}
  />
</div>
```

**Add the EditWholesalerModal at the bottom of the component (before the closing tag):**

```tsx
<EditWholesalerModal
  isOpen={showEditModal}
  onClose={() => {
    setShowEditModal(false);
    setSelectedWholesaler(null);
  }}
  onSuccess={handleEditSuccess}
  wholesaler={selectedWholesaler}
/>
```

**Import Wholesaler type if not already imported:**
```tsx
import { Wholesaler } from '../../types';
```

---

## Task 4: Add updateWholesaler to hooks (if not exists)

### Check/Add to: `src/admin/hooks/useWholesalers.ts`

Make sure this function exists:

```tsx
export const updateWholesaler = async (id: string, data: Partial<Wholesaler>) => {
  const { error } = await supabase
    .from('wholesalers')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
};
```

---

## Summary of Files to Create/Modify

### New Files:
1. `src/admin/components/EditWholesalerModal.tsx` - Modal for editing wholesaler details
2. `src/admin/components/WholesalerActionsDropdown.tsx` - Dropdown menu for actions

### Modified Files:
1. `src/admin/pages/Wholesalers.tsx` - Replace View Deals link with Actions dropdown, add edit modal

---

## UI/UX Notes

- Actions button uses a three-dot (more) icon (`MoreHorizontal` from lucide-react)
- Dropdown appears below and aligned to the right of the button
- Dropdown closes when clicking outside or selecting an action
- Edit modal pre-populates with current wholesaler data
- Edit modal includes a Notes field for internal notes about the wholesaler
- Mobile view also gets the same actions dropdown
- Clicking anywhere on a table row still expands/collapses the details
- Actions dropdown stops propagation so clicking it doesn't trigger row expand

---

## Design Consistency

- Use `#7CB342` (green) for primary actions and icons
- Use `#689F38` for hover states
- Use blue (`text-blue-600`) for edit icon to differentiate from view
- Follow existing modal patterns from AddWholesalerModal and ConfirmModal
- Dropdown has subtle shadow and border matching other UI elements
