import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { PropertyForm } from '../components/PropertyForm';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Property } from '../../types';

export const PropertyEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canDeleteProperties } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

        <PropertyForm property={property} isEdit />
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
    </AdminLayout>
  );
};
