import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Lock, Pencil, X } from 'lucide-react';
import { Property } from '../../types';
import { PropertyFormData } from '../types';
import { US_STATES, PROPERTY_TYPES, PROPERTY_STATUSES } from '../utils/rolePermissions';
import { ImageUploader } from './ImageUploader';
import { RichTextEditor } from './RichTextEditor';
import { WholesalerSelector } from './WholesalerSelector';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { lookupZip } from '../../data/zipCodeData';

interface PropertyFormProps {
  property?: Property;
  isEdit?: boolean;
}

export const PropertyForm = ({ property, isEdit = false }: PropertyFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // County lock state
  const [isCountyLocked, setIsCountyLocked] = useState(false);
  const [showCountyEditDialog, setShowCountyEditDialog] = useState(false);

  const [formData, setFormData] = useState<PropertyFormData>({
    street_address: property?.street_address || '',
    city: property?.city || '',
    county: property?.county || '',
    state: property?.state || '',
    zip_code: property?.zip_code || '',
    asking_price: property?.asking_price || 0,
    arv: property?.arv || null,
    property_type: property?.property_type || 'SFR',
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    square_footage: property?.square_footage || 0,
    status: property?.status || 'Available',
    comments: property?.comments || null,
    image_url: property?.image_url || null,
    is_active: property?.is_active ?? true,
    wholesaler_id: property?.wholesaler_id || null,
    source_email_subject: property?.source_email_subject || null,
    source_email_body: property?.source_email_body || null,
    source_email_date: property?.source_email_date || null,
    auto_imported: property?.auto_imported || false,
  });

  // Auto-fill from ZIP code
  useEffect(() => {
    const zip = formData.zip_code?.trim();
    if (zip && zip.length === 5 && /^\d{5}$/.test(zip)) {
      const zipInfo = lookupZip(zip);
      if (zipInfo) {
        setFormData(prev => ({
          ...prev,
          city: zipInfo.city,
          state: zipInfo.state,
          county: zipInfo.county,
        }));
        setIsCountyLocked(true);
      }
    }
  }, [formData.zip_code]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value || null,
      }));
    }
  };

  const handleCountyEditClick = () => {
    setShowCountyEditDialog(true);
  };

  const handleCountyEditConfirm = () => {
    setIsCountyLocked(false);
    setShowCountyEditDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEdit && property) {
        const { error: updateError } = await supabase
          .from('properties')
          .update({
            ...formData,
            updated_by: user?.id,
          })
          .eq('id', property.id);

        if (updateError) throw updateError;
        success('Property updated successfully!');
      } else {
        const { error: insertError } = await supabase
          .from('properties')
          .insert({
            ...formData,
            created_by: user?.id,
            updated_by: user?.id,
          });

        if (insertError) throw insertError;
        success('Property created successfully!');
      }

      navigate('/admin/properties');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save property';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* County Edit Confirmation Dialog */}
      {showCountyEditDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-amber-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit County?
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Are you sure you want to change the county? It's been automatically matched with the ZIP code you entered.
                </p>
              </div>
              <button
                onClick={() => setShowCountyEditDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCountyEditDialog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCountyEditConfirm}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                Yes, Edit County
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* ROW 1: Image (left 60%) + Wholesaler & Visibility (right 40%) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* LEFT: Property Image - takes 3 columns (60%) */}
          <div className="md:col-span-3 bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Property Image
              </h3>
              {!formData.image_url && (
                <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <AlertCircle size={12} />
                  Image Required
                </span>
              )}
            </div>
            <ImageUploader
              currentImageUrl={formData.image_url}
              onImageUploaded={(url) => setFormData((prev) => ({ ...prev, image_url: url, is_active: true }))}
              onImageRemoved={() => setFormData((prev) => ({ ...prev, image_url: null }))}
            />
            {!formData.image_url && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-800">
                  <strong>Note:</strong> Properties without images will be hidden from the public website by default. Upload an image to make this property visible.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Wholesaler + Visibility - takes 2 columns (40%) */}
          <div className="md:col-span-2 space-y-6">
            {/* Wholesaler Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-4 mb-4">
                Wholesaler
              </h3>
              <WholesalerSelector
                value={formData.wholesaler_id}
                onChange={(wholesalerId) => setFormData(prev => ({ ...prev, wholesaler_id: wholesalerId }))}
              />
              <p className="text-xs text-gray-500 mt-3">
                Select the wholesaler who sent this deal.
              </p>
            </div>

            {/* Visibility Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-4 mb-4">
                Visibility
              </h3>
              <div className={`rounded-lg p-4 ${formData.is_active ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {formData.is_active ? (
                      <Eye className="text-green-600" size={20} />
                    ) : (
                      <EyeOff className="text-gray-400" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="is_active" className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-semibold text-gray-900">
                        Visible on Website
                      </span>
                    </label>
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                      {formData.is_active
                        ? 'Property is live on the public website.'
                        : 'Property is hidden from the public.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Property Address (left 50%) + Property Details (right 50%) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Property Address */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-4">
              Property Address
            </h3>

            {/* Instruction Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">1</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-900">
                    Start with the ZIP Code
                  </p>
                  <p className="text-xs text-blue-700">
                    City, state, and county will auto-populate.
                  </p>
                </div>
              </div>
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                required
                maxLength={10}
                placeholder="Enter 5-digit ZIP code"
                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium"
              />
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
                required
                placeholder="123 Main Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
              />
            </div>

            {/* City and State row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                >
                  <option value="">Select</option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* County with Lock */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  County <span className="text-red-500">*</span>
                </label>
                {isCountyLocked && (
                  <button
                    type="button"
                    onClick={handleCountyEditClick}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <Pencil size={10} />
                    Edit
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  required
                  disabled={isCountyLocked}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent ${
                    isCountyLocked 
                      ? 'bg-gray-50 border-gray-200 text-gray-700 pr-8' 
                      : 'border-gray-300'
                  }`}
                />
                {isCountyLocked && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Lock size={14} className="text-gray-400" />
                  </div>
                )}
              </div>
              {isCountyLocked && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Auto-matched from ZIP code
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Property Details */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-4">
              Property Details
            </h3>

            {/* Asking Price and ARV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asking Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="asking_price"
                  value={formData.asking_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ARV (After Repair Value)
                </label>
                <input
                  type="number"
                  name="arv"
                  value={formData.arv || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>
            </div>

            {/* Property Type and Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                >
                  {PROPERTY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bedrooms, Bathrooms, Square Footage */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sq. Footage
                </label>
                <input
                  type="number"
                  name="square_footage"
                  value={formData.square_footage}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: Comments / Notes (full width) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-4 mb-4">
            Comments / Comps / Notes
          </h3>
          <RichTextEditor
            content={formData.comments || ''}
            onChange={(html) => setFormData((prev) => ({ ...prev, comments: html || null }))}
            placeholder="Add notes about the property, comparable sales, etc."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/properties')}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Property'}
          </button>
        </div>
      </form>
    </>
  );
};
