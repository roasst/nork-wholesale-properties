# BOLT Prompt: Wholesaler Actions Menu & Edit Functionality

## Overview
Replace the "View Deals" text link with an Actions dropdown menu that includes:
1. **View Deals** - Navigate to properties filtered by this wholesaler
2. **Edit Profile** - Open a modal to edit wholesaler details

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
              <p className="text-sm text-gray-500">{wholesaler.total_deals} deals</p>
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

### New Component: `src/admin/components/WholesalerActionsMenu.tsx`

Create a dropdown menu for wholesaler actions:

```tsx
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';

interface WholesalerActionsMenuProps {
  onViewDeals: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

export const WholesalerActionsMenu = ({ 
  onViewDeals, 
  onEdit, 
  onDelete,
  showDelete = false 
}: WholesalerActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Actions"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onViewDeals);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <Eye size={16} className="text-gray-400" />
            View Deals
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onEdit);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <Pencil size={16} className="text-gray-400" />
            Edit Profile
          </button>

          {showDelete && onDelete && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onDelete);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 size={16} />
                Delete Wholesaler
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## Task 3: Update Wholesalers Page

### Modify: `src/admin/pages/Wholesalers.tsx`

Update the page to use the new components.

**Add imports:**
```tsx
import { EditWholesalerModal } from '../components/EditWholesalerModal';
import { WholesalerActionsMenu } from '../components/WholesalerActionsMenu';
import { ConfirmModal } from '../components/ConfirmModal';
import { Wholesaler } from '../../types';
```

**Add state for edit modal and delete confirmation:**
```tsx
const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
```

**Add handlers:**
```tsx
const handleEdit = (wholesaler: Wholesaler) => {
  setSelectedWholesaler(wholesaler);
  setShowEditModal(true);
};

const handleEditSuccess = () => {
  refetch();
  setShowEditModal(false);
  setSelectedWholesaler(null);
};

const handleDeleteClick = (wholesaler: Wholesaler) => {
  setSelectedWholesaler(wholesaler);
  setShowDeleteModal(true);
};

const handleDeleteConfirm = async () => {
  if (!selectedWholesaler) return;
  
  setIsDeleting(true);
  try {
    // Check if wholesaler has any deals
    if (selectedWholesaler.total_deals > 0) {
      showError('Cannot delete wholesaler with existing deals. Remove or reassign their properties first.');
      return;
    }
    
    const { error } = await supabase
      .from('wholesalers')
      .delete()
      .eq('id', selectedWholesaler.id);
    
    if (error) throw error;
    
    success('Wholesaler deleted successfully');
    refetch();
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to delete wholesaler');
  } finally {
    setIsDeleting(false);
    setShowDeleteModal(false);
    setSelectedWholesaler(null);
  }
};
```

**Replace the Actions column in the desktop table:**

Replace:
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

With:
```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    <WholesalerActionsMenu
      onViewDeals={() => handleViewDeals(wholesaler.id)}
      onEdit={() => handleEdit(wholesaler)}
      onDelete={() => handleDeleteClick(wholesaler)}
      showDelete={canToggle} // Only show delete for users who can toggle trusted
    />
    {expandedId === wholesaler.id ? (
      <ChevronUp size={16} className="text-gray-400" />
    ) : (
      <ChevronDown size={16} className="text-gray-400" />
    )}
  </div>
</td>
```

**Update mobile card view - replace the View Deals button:**

Replace:
```tsx
<button
  onClick={() => handleViewDeals(wholesaler.id)}
  className="text-[#7CB342] hover:text-[#689F38] text-sm font-medium"
>
  View Deals →
</button>
```

With:
```tsx
<WholesalerActionsMenu
  onViewDeals={() => handleViewDeals(wholesaler.id)}
  onEdit={() => handleEdit(wholesaler)}
  onDelete={() => handleDeleteClick(wholesaler)}
  showDelete={canToggle}
/>
```

**Add modals at the end of the component (before closing AdminLayout tag):**

```tsx
{/* Edit Wholesaler Modal */}
<EditWholesalerModal
  isOpen={showEditModal}
  onClose={() => {
    setShowEditModal(false);
    setSelectedWholesaler(null);
  }}
  onSuccess={handleEditSuccess}
  wholesaler={selectedWholesaler}
/>

{/* Delete Confirmation Modal */}
<ConfirmModal
  isOpen={showDeleteModal}
  onClose={() => {
    setShowDeleteModal(false);
    setSelectedWholesaler(null);
  }}
  onConfirm={handleDeleteConfirm}
  title="Delete Wholesaler"
  message={
    selectedWholesaler?.total_deals && selectedWholesaler.total_deals > 0
      ? `This wholesaler has ${selectedWholesaler.total_deals} deals. You must remove or reassign their properties before deleting.`
      : `Are you sure you want to delete ${selectedWholesaler?.name}? This action cannot be undone.`
  }
  confirmText="Delete"
  confirmStyle="danger"
  isLoading={isDeleting}
/>
```

**Add supabase import if not already present:**
```tsx
import { supabase } from '../../lib/supabase';
```

---

## Task 4: Update useWholesalers Hook (Optional Enhancement)

### Modify: `src/admin/hooks/useWholesalers.ts`

Add update function if not already present:

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
2. `src/admin/components/WholesalerActionsMenu.tsx` - Dropdown actions menu

### Modified Files:
1. `src/admin/pages/Wholesalers.tsx` - Replace View Deals link with Actions menu, add edit modal

---

## Design Notes

- Actions menu uses a 3-dot vertical icon (MoreVertical from lucide-react)
- Menu items have icons for visual clarity
- Delete option is separated with a divider and shown in red
- Delete is only shown to users with permission (canToggle)
- Cannot delete wholesalers with existing deals (shows error message)
- Edit modal pre-populates with current wholesaler data
- Edit modal includes a Notes field for additional wholesaler info
- Both desktop and mobile views get the actions menu
- Menu closes when clicking outside or after selecting an action
