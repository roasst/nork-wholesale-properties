# BOLT Prompt: Complete Wholesaler Management (Add, Edit, Actions Menu)

## Overview
Implement complete wholesaler management with:
1. **Add Wholesaler Modal** - With phone auto-formatting
2. **Edit Wholesaler Modal** - Pre-populated form with phone formatting
3. **Actions Dropdown Menu** - View Deals, Edit Profile, Delete

**Phone Format:** `(xxx) xxx-xxxx` - 10 digits only, auto-formatted as user types

---

## Task 1: Phone Number Formatting Utility

### Create Helper Function (can be in same file or separate utility)

```tsx
// Format phone number as user types: (xxx) xxx-xxxx
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

// Strip formatting for storage (returns just digits)
const stripPhoneFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Validate phone has 10 digits
const isValidPhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10;
};
```

---

## Task 2: Add Wholesaler Modal

### New Component: `src/admin/components/AddWholesalerModal.tsx`

```tsx
import { useState } from 'react';
import { X, User, Mail, Phone, Building2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../context/ToastContext';

interface AddWholesalerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Phone formatting helpers
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 10);
  
  if (limited.length === 0) return '';
  if (limited.length <= 3) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
};

const isValidPhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10;
};

export const AddWholesalerModal = ({ isOpen, onClose, onSuccess }: AddWholesalerModalProps) => {
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

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
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Auto-format phone number as user types
      setFormData(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(), // Store formatted version
          company_name: formData.company_name.trim() || null,
          is_trusted: false,
          total_deals: 0,
        });
      
      if (error) {
        // Handle duplicate email error
        if (error.code === '23505') {
          showError('A wholesaler with this email already exists');
        } else {
          throw error;
        }
        return;
      }
      
      success('Wholesaler added successfully!');
      onSuccess();
      handleClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add wholesaler');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', email: '', phone: '', company_name: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7CB342] flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Add Wholesaler</h3>
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
              {isSubmitting ? 'Adding...' : 'Add Wholesaler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## Task 3: Edit Wholesaler Modal

### New Component: `src/admin/components/EditWholesalerModal.tsx`

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

// Phone formatting helpers
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.slice(0, 10);
  
  if (limited.length === 0) return '';
  if (limited.length <= 3) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
};

const isValidPhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10;
};

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
        phone: wholesaler.phone ? formatPhoneNumber(wholesaler.phone) : '',
        company_name: wholesaler.company_name || '',
        notes: wholesaler.notes || '',
      });
      setErrors({});
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
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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

## Task 4: Actions Dropdown Menu

### New Component: `src/admin/components/WholesalerActionsMenu.tsx`

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

## Task 5: Update Wholesalers Page

### Modify: `src/admin/pages/Wholesalers.tsx`

**Add these imports at the top:**
```tsx
import { Plus } from 'lucide-react';
import { AddWholesalerModal } from '../components/AddWholesalerModal';
import { EditWholesalerModal } from '../components/EditWholesalerModal';
import { WholesalerActionsMenu } from '../components/WholesalerActionsMenu';
import { ConfirmModal } from '../components/ConfirmModal';
import { Wholesaler } from '../../types';
import { supabase } from '../../lib/supabase';
```

**Add these state variables (after existing useState declarations):**
```tsx
const [showAddModal, setShowAddModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
```

**Add these handler functions (after existing handlers):**
```tsx
const handleAddSuccess = () => {
  refetch();
  setShowAddModal(false);
};

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
    if (selectedWholesaler.total_deals > 0) {
      showError('Cannot delete wholesaler with existing deals. Remove or reassign their properties first.');
      setShowDeleteModal(false);
      setSelectedWholesaler(null);
      setIsDeleting(false);
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

**Update the header section to include the Add button:**

Replace:
```tsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Wholesalers</h1>
    <p className="text-gray-600 mt-1">Manage your wholesale property sources</p>
  </div>
</div>
```

With:
```tsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Wholesalers</h1>
    <p className="text-gray-600 mt-1">Manage your wholesale property sources</p>
  </div>
  <button
    onClick={() => setShowAddModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors"
  >
    <Plus size={20} />
    Add Wholesaler
  </button>
</div>
```

**Replace the Actions column content in the table:**

Find this in the table body:
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

Replace with:
```tsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    <WholesalerActionsMenu
      onViewDeals={() => handleViewDeals(wholesaler.id)}
      onEdit={() => handleEdit(wholesaler)}
      onDelete={() => handleDeleteClick(wholesaler)}
      showDelete={canToggle}
    />
    {expandedId === wholesaler.id ? (
      <ChevronUp size={16} className="text-gray-400" />
    ) : (
      <ChevronDown size={16} className="text-gray-400" />
    )}
  </div>
</td>
```

**Add modals at the end (before closing `</AdminLayout>` tag):**

```tsx
{/* Add Wholesaler Modal */}
<AddWholesalerModal
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  onSuccess={handleAddSuccess}
/>

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

---

## Summary of Files

### New Files (3):
1. `src/admin/components/AddWholesalerModal.tsx`
2. `src/admin/components/EditWholesalerModal.tsx`
3. `src/admin/components/WholesalerActionsMenu.tsx`

### Modified Files (1):
1. `src/admin/pages/Wholesalers.tsx`

---

## Supabase Operations Verified

| Operation | Table | Method | Notes |
|-----------|-------|--------|-------|
| Add Wholesaler | `wholesalers` | `INSERT` | Creates new record with `is_trusted: false`, `total_deals: 0` |
| Edit Wholesaler | `wholesalers` | `UPDATE` | Updates by `id`, sets `updated_at` timestamp |
| Delete Wholesaler | `wholesalers` | `DELETE` | Only if `total_deals === 0` |
| Fetch Wholesalers | `wholesalers` | `SELECT` | Already exists in `useWholesalers` hook |

---

## Phone Number Behavior

- **Input:** Auto-formats as user types
- **Storage:** Stored as formatted string `(xxx) xxx-xxxx`
- **Validation:** Must have exactly 10 digits
- **Display:** Shows formatted in expanded row and edit modal
- **Error:** Shows "Please enter a valid 10-digit phone number" if incomplete
