import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Home, AlertCircle, Eye, EyeOff, CheckCircle, Camera, CameraOff } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { PendingPropertyCard } from '../components/PendingPropertyCard';
import { useAdminProperties } from '../hooks/useAdminProperties';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, getAdminStatusLabel } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { Property } from '../../types';
import { IMAGES } from '../../config/branding';

type StatusFilter = 'all' | 'pending' | 'active' | 'inactive';
type ImageFilter = 'all' | 'has-image' | 'needs-image';

export const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { canEditProperties, canDeleteProperties } = useAuth();
  const { success, error: showError } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>((searchParams.get('status') as StatusFilter) || 'all');
  const [imageFilter, setImageFilter] = useState<ImageFilter>((searchParams.get('image') as ImageFilter) || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [propertyToDeleteAddress, setPropertyToDeleteAddress] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const wholesalerId = searchParams.get('wholesaler') || undefined;

  const { properties, loading, pendingCount, refetch } = useAdminProperties({
    status: statusFilter === 'pending' ? 'pending' : statusFilter === 'all' ? 'all' : undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    wholesaler_id: wholesalerId,
  });

  let filteredProperties = searchTerm
    ? properties.filter((p) =>
        `${p.street_address} ${p.city} ${p.state} ${p.zip_code} ${p.property_type}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : properties;

  if (imageFilter === 'has-image') {
    filteredProperties = filteredProperties.filter((p) => p.image_url);
  } else if (imageFilter === 'needs-image') {
    filteredProperties = filteredProperties.filter((p) => !p.image_url);
  }

  const pendingProperties = filteredProperties.filter(p => p.status === 'pending');
  const regularProperties = filteredProperties.filter(p => p.status !== 'pending');

  const handleDeleteClick = (id: string) => {
    setPropertyToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: false })
        .eq('id', propertyToDelete);

      if (error) throw error;

      success('Property moved to inactive');
      refetch();
    } catch (error) {
      showError('Failed to deactivate property');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;

      success('Property restored successfully');
      refetch();
    } catch (error) {
      showError('Failed to restore property');
    }
  };

  const handleToggleVisibility = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !currentValue })
        .eq('id', id);

      if (error) throw error;

      success(currentValue ? 'Property hidden from website' : 'Property now visible on website');
      refetch();
    } catch (error) {
      showError('Failed to update property visibility');
    }
  };

  const handleApproveProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: 'Available', is_active: true })
        .eq('id', id);

      if (error) throw error;

      success('Property approved and is now live');
      refetch();
    } catch (error) {
      showError('Failed to approve property');
    }
  };

  const handlePermanentDeleteClick = (property: Property) => {
    setPropertyToDelete(property.id);
    setPropertyToDeleteAddress(property.street_address);
    setShowPermanentDeleteModal(true);
  };

  const handlePermanentDelete = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete);

      if (error) throw error;

      success('Property permanently deleted');
      refetch();
    } catch (error) {
      showError('Failed to permanently delete property');
    } finally {
      setIsDeleting(false);
      setShowPermanentDeleteModal(false);
      setPropertyToDelete(null);
      setPropertyToDeleteAddress('');
    }
  };

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    const newParams = new URLSearchParams(searchParams);
    if (filter !== 'all') {
      newParams.set('status', filter);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams);
  };

  const handleImageFilterChange = (filter: ImageFilter) => {
    setImageFilter(filter);
    const newParams = new URLSearchParams(searchParams);
    if (filter !== 'all') {
      newParams.set('image', filter);
    } else {
      newParams.delete('image');
    }
    setSearchParams(newParams);
  };

  const needsImageCount = properties.filter((p) => !p.image_url && p.status !== 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          {canEditProperties && (
            <Link
              to="/admin/properties/new"
              className="inline-flex items-center justify-center gap-2 bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Property
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilterChange('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#7CB342] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilterChange('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AlertCircle size={16} />
                Pending Review
                {pendingCount > 0 && (
                  <span className="bg-white text-amber-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleStatusFilterChange('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleStatusFilterChange('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          <div className="mb-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Images</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleImageFilterChange('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  imageFilter === 'all'
                    ? 'bg-[#7CB342] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleImageFilterChange('has-image')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  imageFilter === 'has-image'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Camera size={16} />
                Has Image
              </button>
              <button
                onClick={() => handleImageFilterChange('needs-image')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  imageFilter === 'needs-image'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CameraOff size={16} />
                Needs Image
                {needsImageCount > 0 && (
                  <span className={`${imageFilter === 'needs-image' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'} px-2 py-0.5 rounded-full text-xs font-bold`}>
                    {needsImageCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CB342] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <>
            {pendingProperties.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="text-amber-500" />
                  Pending Review ({pendingProperties.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingProperties.map((property) => (
                    <PendingPropertyCard
                      key={property.id}
                      property={property}
                      onUpdate={refetch}
                    />
                  ))}
                </div>
              </div>
            )}

            {regularProperties.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visibility
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {regularProperties.map((property) => (
                        <tr key={property.id} className={!property.is_active ? 'bg-gray-50 opacity-60' : ''}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-16 h-16 flex-shrink-0">
                                {property.image_url ? (
                                  <img
                                    src={property.image_url}
                                    alt={property.street_address}
                                    className="w-full h-full rounded object-cover"
                                    onError={(e) => { e.currentTarget.src = IMAGES.placeholder; }}
                                  />
                                ) : (
                                  <div className="w-full h-full rounded bg-gray-200 flex items-center justify-center">
                                    <CameraOff size={24} className="text-gray-400" />
                                  </div>
                                )}
                                {!property.image_url && (
                                  <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5">
                                    <AlertCircle size={12} className="text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{property.street_address}</p>
                                  {!property.image_url && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                      No Image
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {property.city}, {property.state} {property.zip_code}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{formatCurrency(property.asking_price)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{property.property_type}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                property.status === 'Available' ? 'bg-green-100 text-green-800' :
                                property.status === 'Under Contract' ? 'bg-blue-100 text-blue-800' :
                                property.status === 'Sold' ? 'bg-gray-100 text-gray-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {getAdminStatusLabel(property.status)}
                              </span>
                              {property.status === 'pending' && canEditProperties && (
                                <button
                                  onClick={() => handleApproveProperty(property.id)}
                                  className="text-green-600 hover:text-green-700 p-1"
                                  title="Approve Property"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {canEditProperties ? (
                              <button
                                onClick={() => handleToggleVisibility(property.id, property.is_active)}
                                className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                                  property.is_active ? 'text-green-600' : 'text-gray-400'
                                }`}
                                title={property.is_active ? 'Visible on website - Click to hide' : 'Hidden from website - Click to show'}
                              >
                                {property.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                              </button>
                            ) : (
                              <span className={property.is_active ? 'text-green-600' : 'text-gray-400'}>
                                {property.is_active ? <Eye size={20} className="mx-auto" /> : <EyeOff size={20} className="mx-auto" />}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {canEditProperties && (
                                <Link
                                  to={`/admin/properties/edit/${property.id}`}
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </Link>
                              )}
                              {canDeleteProperties && (
                                <>
                                  {property.is_active ? (
                                    <button
                                      onClick={() => handleDeleteClick(property.id)}
                                      className="text-red-600 hover:text-red-700 p-1"
                                      title="Deactivate"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handlePermanentDeleteClick(property)}
                                      className="text-red-600 hover:text-red-700 p-1"
                                      title="Delete Forever"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : pendingProperties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Home size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first property'}
                </p>
                {canEditProperties && !searchTerm && (
                  <Link
                    to="/admin/properties/new"
                    className="inline-flex items-center gap-2 bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                    Add Property
                  </Link>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Deactivate Property"
        message="Are you sure you want to deactivate this property? It will no longer appear on the public website."
        confirmText="Deactivate"
        confirmStyle="danger"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={showPermanentDeleteModal}
        onClose={() => setShowPermanentDeleteModal(false)}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete Property?"
        message={`This will permanently delete ${propertyToDeleteAddress}. This action cannot be undone.`}
        confirmText="Delete Forever"
        confirmStyle="danger"
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
};
