import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Phone, Mail, Building2, TrendingUp, Calendar } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { useWholesalers, toggleTrusted } from '../hooks/useWholesalers';
import { TrustedToggle } from '../components/TrustedToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { canToggleTrusted } from '../utils/rolePermissions';

export const Wholesalers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'deals' | 'date' | 'name'>('deals');

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
          <div className="overflow-x-auto">
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
                    {expandedId === wholesaler.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              {wholesaler.phone && (
                                <a
                                  href={`tel:${wholesaler.phone}`}
                                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#7CB342]"
                                >
                                  <Phone size={16} />
                                  {wholesaler.phone}
                                </a>
                              )}
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
    </AdminLayout>
  );
};
