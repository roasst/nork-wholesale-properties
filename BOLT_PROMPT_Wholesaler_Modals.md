# BOLT.new Prompt: Add Wholesaler Management Modals

## Task Overview
Add "Add Wholesaler" and "Edit Wholesaler" modals to the admin Wholesalers page with phone auto-formatting. Ensure wholesalers are ONLY accessible in the admin area (not public-facing).

---

## Security Requirement

**IMPORTANT:** The Wholesalers page and all wholesaler data must ONLY be accessible to authenticated admin users. Verify:
1. Wholesalers.tsx is in `src/admin/pages/` (admin-only route)
2. Uses `AdminLayout` wrapper (requires auth)
3. NO wholesaler routes exist in public routes
4. NO wholesaler links in public navigation

---

## File 1: Create `src/admin/components/AddWholesalerModal.tsx`

```tsx
import { useState } from 'react';
import { X, User, Mail, Phone, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AddWholesalerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Phone formatting: 5551234567 -> (555) 123-4567
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

// Validate phone has exactly 10 digits
const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
};

export const AddWholesalerModal = ({ isOpen, onClose, onSuccess }: AddWholesalerModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('wholesalers').insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        company_name: formData.company_name.trim() || null,
        is_trusted: false,
        total_deals: 0,
      });

      if (error) throw error;

      onSuccess();
      handleClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to add wholesaler' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', company_name: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Wholesaler</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="ABC Investments LLC"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Wholesaler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## File 2: Create `src/admin/components/EditWholesalerModal.tsx`

```tsx
import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, FileText, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Wholesaler } from '../../types';
import { ConfirmModal } from './ConfirmModal';

interface EditWholesalerModalProps {
  isOpen: boolean;
  wholesaler: Wholesaler | null;
  onClose: () => void;
  onSuccess: () => void;
}

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const isValidPhone = (phone: string): boolean => {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 0 || digits.length === 10;
};

export const EditWholesalerModal = ({ isOpen, wholesaler, onClose, onSuccess }: EditWholesalerModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !wholesaler) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('wholesalers')
        .update({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone || null,
          company_name: formData.company_name.trim() || null,
          notes: formData.notes.trim() || null,
        })
        .eq('id', wholesaler.id);

      if (error) throw error;

      onSuccess();
      handleClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to update wholesaler' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!wholesaler) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('wholesalers')
        .delete()
        .eq('id', wholesaler.id);

      if (error) throw error;

      setShowDeleteConfirm(false);
      onSuccess();
      handleClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to delete wholesaler' });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', company_name: '', notes: '' });
    setErrors({});
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !wholesaler) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Wholesaler</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="ABC Investments LLC"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add notes about this wholesaler..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Statistics</p>
              <div className="flex gap-6 text-sm text-gray-600">
                <span>Total Deals: <strong className="text-gray-900">{wholesaler.total_deals}</strong></span>
                <span>Trusted: <strong className="text-gray-900">{wholesaler.is_trusted ? 'Yes' : 'No'}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Wholesaler"
        message={`Are you sure you want to delete "${wholesaler.name}"? This action cannot be undone. Their deals will remain but will no longer be linked to this wholesaler.`}
        confirmText="Delete"
        confirmStyle="danger"
        isLoading={isDeleting}
      />
    </>
  );
};
```

---

## File 3: Update `src/admin/pages/Wholesalers.tsx`

Replace the entire file with:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Phone, Mail, Building2, TrendingUp, Calendar, Plus, Pencil } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { useWholesalers, toggleTrusted } from '../hooks/useWholesalers';
import { TrustedToggle } from '../components/TrustedToggle';
import { AddWholesalerModal } from '../components/AddWholesalerModal';
import { EditWholesalerModal } from '../components/EditWholesalerModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { canToggleTrusted } from '../utils/rolePermissions';
import { Wholesaler } from '../../types';

export const Wholesalers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'deals' | 'date' | 'name'>('deals');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWholesaler, setEditingWholesaler] = useState<Wholesaler | null>(null);

  const { wholesalers, loading, error, refetch } = useWholesalers({
    search: searchTerm,
  });

  const canToggle = user ? canToggleTrusted(user.role) : false;

  const sortedWholesalers = [...wholesalers].sort((a, b) => {
    if (sortBy === 'deals') {
      return b.total_deals - a.total_deals;
    } else if (sortBy === 'date') {
      const dateA = a.last_deal_date ? new Date(a.last_deal_date).getTime() : 0;
      const dateB = b.last_deal_date ? new Date(b.last_deal_date).getTime() : 0;
      return dateB - dateA;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const handleToggleTrusted = async (id: string, currentValue: boolean) => {
    try {
      await toggleTrusted(id, currentValue);
      success(currentValue ? 'Trusted status removed' : 'Marked as trusted');
      refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update trusted status');
    }
  };

  const handleViewDeals = (wholesalerId: string) => {
    navigate(`/admin/properties?wholesaler=${wholesalerId}`);
  };

  const handleAddSuccess = () => {
    success('Wholesaler added successfully');
    refetch();
  };

  const handleEditSuccess = () => {
    success('Wholesaler updated successfully');
    refetch();
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CB342]" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-800 font-medium text-xl mb-4">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wholesalers</h1>
            <p className="text-gray-600 mt-1">Manage your wholesale property sources</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'deals' | 'date' | 'name')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
          >
            <option value="deals">Sort by Deals</option>
            <option value="date">Sort by Last Deal</option>
            <option value="name">Sort by Name</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Add Wholesaler
          </button>
        </div>

        {sortedWholesalers.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Wholesalers Yet</h3>
            <p className="text-gray-600 mb-4">
              Wholesalers will appear here when deals are imported from their emails.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Add Your First Wholesaler
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Deal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trusted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedWholesalers.map((wholesaler) => (
                    <>
                      <tr
                        key={wholesaler.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setExpandedId(expandedId === wholesaler.id ? null : wholesaler.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#7CB342] flex items-center justify-center text-white font-bold">
                              {wholesaler.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{wholesaler.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
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
                              {wholesaler.company_name}
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
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingWholesaler(wholesaler);
                              }}
                              className="text-gray-500 hover:text-[#7CB342] transition-colors"
                              title="Edit wholesaler"
                            >
                              <Pencil size={16} />
                            </button>
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
                      {expandedId === wholesaler.id && (
                        <tr key={`${wholesaler.id}-expanded`}>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <div className="flex items-center gap-4">
                                {wholesaler.phone && (
                                  <a
                                    href={`tel:${wholesaler.phone}`}
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#7CB342]"
                                  >
                                    <Phone size={16} />
                                    {wholesaler.phone}
                                  </a>
                                )}
                                <button
                                  onClick={() => setEditingWholesaler(wholesaler)}
                                  className="flex items-center gap-1 text-sm text-[#7CB342] hover:text-[#689F38] font-medium"
                                >
                                  <Pencil size={14} />
                                  Edit Profile
                                </button>
                              </div>
                              {wholesaler.notes && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                                  <p className="text-sm text-gray-700">{wholesaler.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AddWholesalerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <EditWholesalerModal
        isOpen={!!editingWholesaler}
        wholesaler={editingWholesaler}
        onClose={() => setEditingWholesaler(null)}
        onSuccess={handleEditSuccess}
      />
    </AdminLayout>
  );
};
```

---

## Security Verification Checklist

After implementation, verify:

1. [ ] `/admin/wholesalers` requires login (redirects to login if not authenticated)
2. [ ] No "Wholesalers" link appears in public navigation/header
3. [ ] Wholesalers page uses `AdminLayout` (which requires auth)
4. [ ] Direct URL access to `/admin/wholesalers` when logged out redirects to login
5. [ ] Public pages (home, property listings) have NO access to wholesaler data

---

## Testing Checklist

1. [ ] "+ Add Wholesaler" button visible in header
2. [ ] Add modal opens and phone auto-formats as you type
3. [ ] Validation errors show for missing required fields
4. [ ] New wholesaler appears in list after adding
5. [ ] Pencil edit icon visible in Actions column
6. [ ] Edit modal pre-populates with existing data
7. [ ] Save changes updates the wholesaler
8. [ ] Delete button shows confirmation dialog
9. [ ] Confirming delete removes wholesaler from list
10. [ ] Toast messages appear for success/error states
