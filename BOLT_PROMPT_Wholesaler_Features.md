# BOLT Prompt: Wholesaler Management Features

## Overview
Add wholesaler management features to the existing React/Vite/TypeScript application:
1. **Add Wholesaler button + modal** on the Wholesalers page
2. **Wholesaler selector component** for Add/Edit Property forms (searchable dropdown with "Create New" option)
3. **Fix responsive design** on Wholesalers table for mobile

---

## Task 1: Add Wholesaler Modal on Wholesalers Page

### File to modify: `src/admin/pages/Wholesalers.tsx`

Add an "Add Wholesaler" button in the header section and implement an AddWholesalerModal.

**Requirements:**
- Add a green "Add Wholesaler" button with a plus icon next to the search bar
- Clicking opens a modal dialog (follow existing `ConfirmModal` pattern)
- Modal form fields:
  - **Name** (required) - text input
  - **Email** (required) - email input
  - **Phone** (required) - phone input
  - **Company Name** (optional) - text input
- On submit: Insert into `wholesalers` table via Supabase, show success toast, close modal, refetch list
- On error: Show error toast
- Validate email format before submit

**Add this import:**
```tsx
import { Plus } from 'lucide-react';
```

**Add state for modal:**
```tsx
const [showAddModal, setShowAddModal] = useState(false);
```

**Add button next to search/sort controls:**
```tsx
<button
  onClick={() => setShowAddModal(true)}
  className="inline-flex items-center gap-2 bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
>
  <Plus size={20} />
  Add Wholesaler
</button>
```

### New Component: `src/admin/components/AddWholesalerModal.tsx`

Create a new modal component:

```tsx
import { useState } from 'react';
import { X, User, Mail, Phone, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../context/ToastContext';

interface AddWholesalerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
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
          phone: formData.phone.trim(),
          company_name: formData.company_name.trim() || null,
          is_trusted: false,
          total_deals: 0,
        });
      
      if (error) {
        if (error.code === '23505') {
          showError('A wholesaler with this email already exists');
        } else {
          throw error;
        }
        return;
      }
      
      success('Wholesaler added successfully!');
      setFormData({ name: '', email: '', phone: '', company_name: '' });
      onSuccess();
      onClose();
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New Wholesaler</h3>
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

## Task 2: Wholesaler Selector Component for Property Forms

### New Component: `src/admin/components/WholesalerSelector.tsx`

Create a searchable dropdown with "Create New" option:

```tsx
import { useState, useEffect, useRef } from 'react';
import { Search, Plus, ChevronDown, X, User, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Wholesaler } from '../../types';
import { AddWholesalerModal } from './AddWholesalerModal';

interface WholesalerSelectorProps {
  value: string | null;
  onChange: (wholesalerId: string | null) => void;
}

export const WholesalerSelector = ({ value, onChange }: WholesalerSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch wholesalers
  useEffect(() => {
    fetchWholesalers();
  }, []);

  // Fetch selected wholesaler details when value changes
  useEffect(() => {
    if (value && !selectedWholesaler) {
      fetchSelectedWholesaler();
    } else if (!value) {
      setSelectedWholesaler(null);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWholesalers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wholesalers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setWholesalers(data || []);
    } catch (err) {
      console.error('Failed to fetch wholesalers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedWholesaler = async () => {
    if (!value) return;
    
    try {
      const { data, error } = await supabase
        .from('wholesalers')
        .select('*')
        .eq('id', value)
        .maybeSingle();

      if (error) throw error;
      setSelectedWholesaler(data);
    } catch (err) {
      console.error('Failed to fetch selected wholesaler:', err);
    }
  };

  const filteredWholesalers = wholesalers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.company_name && w.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (wholesaler: Wholesaler) => {
    setSelectedWholesaler(wholesaler);
    onChange(wholesaler.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedWholesaler(null);
    onChange(null);
  };

  const handleAddSuccess = () => {
    fetchWholesalers();
    setShowAddModal(false);
  };

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Wholesaler
      </label>

      {selectedWholesaler ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-[#7CB342] rounded-lg">
          <div className="w-10 h-10 rounded-full bg-[#7CB342] flex items-center justify-center text-white font-bold flex-shrink-0">
            {selectedWholesaler.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{selectedWholesaler.name}</p>
            <p className="text-xs text-gray-600 truncate">{selectedWholesaler.email}</p>
            {selectedWholesaler.company_name && (
              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                <Building2 size={10} />
                {selectedWholesaler.company_name}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpenDropdown}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-[#7CB342] focus:border-transparent transition-colors"
        >
          <span className="text-gray-500">Select a wholesaler...</span>
          <ChevronDown size={18} className="text-gray-400" />
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search wholesalers..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredWholesalers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No wholesalers found' : 'No wholesalers yet'}
              </div>
            ) : (
              filteredWholesalers.map((wholesaler) => (
                <button
                  key={wholesaler.id}
                  type="button"
                  onClick={() => handleSelect(wholesaler)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#7CB342] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {wholesaler.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{wholesaler.name}</p>
                    <p className="text-xs text-gray-500 truncate">{wholesaler.email}</p>
                  </div>
                  {wholesaler.is_trusted && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                      Trusted
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowAddModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 p-2 text-[#7CB342] hover:bg-green-50 rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Create New Wholesaler
            </button>
          </div>
        </div>
      )}

      <AddWholesalerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};
```

### Modify: `src/admin/components/PropertyForm.tsx`

Add the WholesalerSelector to the PropertyForm.

**Add import:**
```tsx
import { WholesalerSelector } from './WholesalerSelector';
```

**Add a new section after "Property Details" section, before the "Visible on Website" toggle:**

```tsx
{/* Wholesaler Section */}
<div className="bg-white rounded-lg shadow-md p-6 space-y-6">
  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-4">
    Wholesaler
  </h3>
  <WholesalerSelector
    value={formData.wholesaler_id}
    onChange={(wholesalerId) => setFormData(prev => ({ ...prev, wholesaler_id: wholesalerId }))}
  />
  <p className="text-xs text-gray-500">
    Select the wholesaler who sent this deal, or create a new one if they're not in the system.
  </p>
</div>
```

---

## Task 3: Fix Responsive Design on Wholesalers Table

### Modify: `src/admin/pages/Wholesalers.tsx`

Replace the existing table with a responsive version that shows different layouts for desktop/mobile.

**Key changes:**
1. Hide Company, Deals, and Last Deal columns on mobile
2. Always show: Contact (name + email), Trusted toggle, Actions
3. Use responsive breakpoints: `hidden md:table-cell` for optional columns
4. Stack contact info better on mobile

**Replace the table section with:**

```tsx
{sortedWholesalers.length === 0 ? (
  // ... existing empty state ...
) : (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {/* Desktop Table View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deals
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Deal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trusted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedWholesalers.map((wholesaler) => (
            <tr
              key={wholesaler.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setExpandedId(expandedId === wholesaler.id ? null : wholesaler.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7CB342] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {wholesaler.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{wholesaler.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                      <Mail size={12} />
                      {wholesaler.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {wholesaler.company_name ? (
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Building2 size={14} />
                    <span className="truncate max-w-[150px]">{wholesaler.company_name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <TrendingUp size={16} className="text-[#7CB342]" />
                  <span className="text-sm font-semibold text-gray-900">{wholesaler.total_deals}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  {formatDate(wholesaler.last_deal_date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TrustedToggle
                  isTrusted={wholesaler.is_trusted}
                  onChange={() => handleToggleTrusted(wholesaler.id, wholesaler.is_trusted)}
                  disabled={!canToggle}
                />
              </td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Card View */}
    <div className="md:hidden divide-y divide-gray-200">
      {sortedWholesalers.map((wholesaler) => (
        <div key={wholesaler.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-[#7CB342] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {wholesaler.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">{wholesaler.name}</p>
                  <a 
                    href={`mailto:${wholesaler.email}`}
                    className="text-sm text-gray-600 hover:text-[#7CB342] truncate block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {wholesaler.email}
                  </a>
                </div>
                <TrustedToggle
                  isTrusted={wholesaler.is_trusted}
                  onChange={() => handleToggleTrusted(wholesaler.id, wholesaler.is_trusted)}
                  disabled={!canToggle}
                />
              </div>
              
              {wholesaler.company_name && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Building2 size={14} />
                  {wholesaler.company_name}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-[#7CB342]">{wholesaler.total_deals}</span> deals
                </span>
                <button
                  onClick={() => handleViewDeals(wholesaler.id)}
                  className="text-[#7CB342] hover:text-[#689F38] text-sm font-medium"
                >
                  View Deals →
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## Hook Updates

### Add to: `src/admin/hooks/useWholesalers.ts`

Add a function to create wholesalers:

```tsx
export const createWholesaler = async (data: {
  name: string;
  email: string;
  phone: string;
  company_name?: string | null;
}) => {
  const { data: newWholesaler, error } = await supabase
    .from('wholesalers')
    .insert({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      company_name: data.company_name || null,
      is_trusted: false,
      total_deals: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return newWholesaler;
};
```

---

## Summary of Files to Create/Modify

### New Files:
1. `src/admin/components/AddWholesalerModal.tsx` - Modal for adding wholesalers
2. `src/admin/components/WholesalerSelector.tsx` - Searchable dropdown component

### Modified Files:
1. `src/admin/pages/Wholesalers.tsx` - Add button, modal, responsive table
2. `src/admin/components/PropertyForm.tsx` - Add WholesalerSelector section
3. `src/admin/hooks/useWholesalers.ts` - Add createWholesaler function

---

## Design Notes

- Use brand color `#7CB342` (green) for primary actions
- Use `#689F38` for hover states
- Follow existing modal pattern from `ConfirmModal.tsx`
- Use existing toast context for notifications
- All forms should have proper validation before submit
- Responsive breakpoint: `md:` (768px) for table/card switch
