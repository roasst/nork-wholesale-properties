import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Mail, Phone, Building2, Users } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { PropertyForm } from '../components/PropertyForm';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmailPreviewModal } from '../components/EmailPreviewModal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Property, Wholesaler } from '../../types';

export const PropertyEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canDeleteProperties } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [wholesaler, setWholesaler] = useState<Wholesaler | null>(null);
  const [additionalWholesalers, setAdditionalWholesalers] = useState<Wholesaler[]>([]);
  const [additionalWholesalerIds, setAdditionalWholesalerIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Property not found');
        return;
      }

      setProperty(data);

      // Fetch primary wholesaler
      if (data.wholesaler_id) {
        const { data: wholesalerData, error: wholesalerError } = await supabase
          .from('wholesalers')
          .select('*')
          .eq('id', data.wholesaler_id)
          .maybeSingle();

        if (!wholesalerError && wholesalerData) {
          setWholesaler(wholesalerData);
        }
      }

      // Fetch additional wholesalers from junction table
      const { data: additionalData, error: additionalError } = await supabase
        .from('property_wholesalers')
        .select('wholesaler_id, wholesalers(*)')
        .eq('property_id', id);

      if (!additionalError && additionalData) {
        const ids = additionalData.map(item => item.wholesaler_id);
        const wholesalersData = additionalData
          .map(item => item.wholesalers as Wholesaler)
          .filter(Boolean);
        
        setAdditionalWholesalerIds(ids);
        setAdditionalWholesalers(wholesalersData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('properties')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      navigate('/admin/properties');
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const totalWholesalers = (wholesaler ? 1 : 0) + additionalWholesalers.length;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CB342] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !property) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-800 font-medium text-xl mb-4">{error || 'Property not found'}</p>
          <button
            onClick={() => navigate('/admin/properties')}
            className="bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          {canDeleteProperties && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              Delete Property
            </button>
          )}
        </div>

        {/* Primary Wholesaler Contact Card */}
        {wholesaler && (
          <div className="bg-gradient-to-br from-green-50 to-white border-2 border-[#7CB342] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-[#7CB342]" />
                <h3 className="text-lg font-bold text-gray-900">Primary Wholesaler Contact</h3>
              </div>
              {totalWholesalers > 1 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  <Users size={14} />
                  +{totalWholesalers - 1} more
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-2">{wholesaler.name}</p>
                {wholesaler.company_name && (
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <Building2 size={16} />
                    <span>{wholesaler.company_name}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <a
                    href={`mailto:${wholesaler.email}`}
                    className="flex items-center gap-2 text-sm text-[#7CB342] hover:text-[#689F38] font-medium"
                  >
                    <Mail size={16} />
                    {wholesaler.email}
                  </a>
                  {wholesaler.phone && (
                    <a
                      href={`tel:${wholesaler.phone}`}
                      className="flex items-center gap-2 text-sm text-[#7CB342] hover:text-[#689F38] font-medium"
                    >
                      <Phone size={16} />
                      {wholesaler.phone}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/admin/properties?wholesaler=${wholesaler.id}`)}
                  className="w-full py-2 px-4 bg-white border-2 border-[#7CB342] text-[#7CB342] hover:bg-[#7CB342] hover:text-white font-medium rounded-lg transition-colors"
                >
                  View All Deals from This Wholesaler
                </button>
                {wholesaler.is_trusted && (
                  <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Trusted Sender
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional Wholesalers Summary */}
        {additionalWholesalers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-blue-600" />
              <h4 className="font-semibold text-gray-900">Additional Wholesalers ({additionalWholesalers.length})</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {additionalWholesalers.map(w => (
                <div 
                  key={w.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-full text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {w.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-800">{w.name}</span>
                  {w.is_trusted && (
                    <span className="w-2 h-2 bg-green-500 rounded-full" title="Trusted"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {property?.auto_imported && property.source_email_subject && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Original Email</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Subject</p>
                <p className="text-sm font-medium text-gray-900">{property.source_email_subject}</p>
              </div>
              {property.source_email_date && (
                <div>
                  <p className="text-xs text-gray-600">Received</p>
                  <p className="text-sm text-gray-900">
                    {new Date(property.source_email_date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              )}
              {property.source_email_body && (
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Full Email
                </button>
              )}
            </div>
          </div>
        )}

        <PropertyForm 
          property={property} 
          isEdit 
          additionalWholesalerIds={additionalWholesalerIds}
        />
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete"
        confirmStyle="danger"
        isLoading={isDeleting}
      />

      {property?.source_email_body && (
        <EmailPreviewModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          subject={property.source_email_subject || ''}
          body={property.source_email_body}
          date={property.source_email_date || ''}
        />
      )}
    </AdminLayout>
  );
};
