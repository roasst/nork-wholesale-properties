import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, RotateCcw, Search } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Property } from '../../types';
import { formatCurrency } from '../../lib/utils';

export const Properties = () => {
  const { canEditProperties, canDeleteProperties } = useAuth();
  const { success, error: showError } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = properties.filter((p) =>
        `${p.street_address} ${p.city} ${p.state} ${p.zip_code} ${p.property_type}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(properties);
    }
  }, [searchTerm, properties]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      showError('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

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
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
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
      fetchProperties();
    } catch (error) {
      console.error('Error restoring property:', error);
      showError('Failed to restore property');
    }
  };

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

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CB342] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className={!property.is_active ? 'bg-gray-50 opacity-60' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {property.image_url && (
                            <img
                              src={property.image_url}
                              alt={property.street_address}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{property.street_address}</p>
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {property.is_active ? 'Yes' : 'No'}
                        </span>
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
                                  onClick={() => handleRestore(property.id)}
                                  className="text-green-600 hover:text-green-700 p-1"
                                  title="Restore"
                                >
                                  <RotateCcw size={18} />
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
        ) : (
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

    </AdminLayout>
  );
};
