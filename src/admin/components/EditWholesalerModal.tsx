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
  if (!phone) return true; // Phone is optional for edit
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
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
          {/* Header */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Name */}
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

            {/* Email */}
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

            {/* Phone */}
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

            {/* Company Name */}
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

            {/* Notes */}
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

            {/* Stats (read-only) */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Statistics</p>
              <div className="flex gap-6 text-sm text-gray-600">
                <span>Total Deals: <strong className="text-gray-900">{wholesaler.total_deals}</strong></span>
                <span>Trusted: <strong className="text-gray-900">{wholesaler.is_trusted ? 'Yes' : 'No'}</strong></span>
              </div>
            </div>

            {/* Buttons */}
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

      {/* Delete Confirmation Modal */}
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
