import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, Mail, Building2, TrendingUp, Plus, Pencil, ExternalLink } from 'lucide-react';
import { Wholesaler } from '../../types';
import { AdminLayout } from '../components/AdminLayout';
import { useWholesalers, toggleTrusted } from '../hooks/useWholesalers';
import { TrustedToggle } from '../components/TrustedToggle';
import { AddWholesalerModal } from '../components/AddWholesalerModal';
import { EditWholesalerModal } from '../components/EditWholesalerModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { canToggleTrusted } from '../utils/rolePermissions';

export const Wholesalers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWholesaler, setEditingWholesaler] = useState<Wholesaler | null>(null);

  const { wholesalers, loading, error, refetch } = useWholesalers({
    search: searchTerm,
  });

  const canToggle = user ? canToggleTrusted(user.role) : false;

  // Sort by total deals (descending) by default
  const sortedWholesalers = [...wholesalers].sort((a, b) => b.total_deals - a.total_deals);

  const handleToggleTrusted = async (id: string, currentValue: boolean) => {
    try {
      await toggleTrusted(id, currentValue);
      success(currentValue ? 'Trusted status removed' : 'Marked as trusted');
      refetch();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update trusted status');
    }
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

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            Add Wholesaler
          </button>
        </div>

        {sortedWholesalers.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Wholesalers Yet</h3>
            <p className="text-gray-600">
              Wholesalers will appear here when deals are imported from their emails.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Desktop Table */}
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
                      onClick={() => navigate(`/admin/properties?wholesaler=${wholesaler.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      title="Click to view properties from this wholesaler"
                    >
                      <td className="px-6 py-4">
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
                            {wholesaler.phone && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                <Phone size={12} />
                                {wholesaler.phone}
                              </p>
                            )}
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
                              navigate(`/admin/properties?wholesaler=${wholesaler.id}`);
                            }}
                            className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50"
                            title="View properties"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingWholesaler(wholesaler);
                            }}
                            className="text-gray-500 hover:text-[#7CB342] transition-colors p-2 rounded-lg hover:bg-gray-100"
                            title="Edit wholesaler"
                          >
                            <Pencil size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
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
                          >
                            {wholesaler.email}
                          </a>
                          {wholesaler.phone && (
                            <a
                              href={`tel:${wholesaler.phone}`}
                              className="text-sm text-gray-600 hover:text-[#7CB342] truncate block"
                            >
                              {wholesaler.phone}
                            </a>
                          )}
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

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-[#7CB342]">{wholesaler.total_deals}</span> deals
                        </span>
                        <button
                          onClick={() => setEditingWholesaler(wholesaler)}
                          className="text-gray-500 hover:text-[#7CB342] text-sm font-medium flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddWholesalerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          refetch();
          setShowAddModal(false);
        }}
      />

      <EditWholesalerModal
        isOpen={!!editingWholesaler}
        wholesaler={editingWholesaler}
        onClose={() => setEditingWholesaler(null)}
        onSuccess={() => {
          refetch();
          success('Wholesaler updated successfully');
        }}
      />
    </AdminLayout>
  );
};
