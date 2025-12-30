import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Calendar, TrendingUp } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { useWholesaler } from '../hooks/useWholesalers';
import { useAdminProperties } from '../hooks/useAdminProperties';
import { WholesalerCard } from '../components/WholesalerCard';

export const WholesalerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { wholesaler, loading: wholesalerLoading, error: wholesalerError } = useWholesaler(id);
  const { properties, loading: propertiesLoading } = useAdminProperties({
    wholesaler_id: id,
  });

  if (wholesalerLoading || propertiesLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CB342]" />
        </div>
      </AdminLayout>
    );
  }

  if (wholesalerError || !wholesaler) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-800 font-medium text-xl mb-4">
            {wholesalerError || 'Wholesaler not found'}
          </p>
          <Link to="/admin/wholesalers" className="text-[#7CB342] hover:text-[#689F38] font-semibold">
            Back to Wholesalers
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
      <Link
        to="/admin/wholesalers"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
      >
        <ArrowLeft size={20} />
        Back to Wholesalers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WholesalerCard wholesaler={wholesaler} />

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp size={16} />
                  <span className="text-sm">Total Deals</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{wholesaler.total_deals}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span className="text-sm">Last Deal</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(wholesaler.last_deal_date)}
                </span>
              </div>
            </div>
          </div>

          {wholesaler.notes && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{wholesaler.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Properties from this Wholesaler
          </h2>

          {properties.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-600">No properties yet from this wholesaler</p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <Link
                  key={property.id}
                  to={`/admin/properties/edit/${property.id}`}
                  className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {property.street_address}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {property.city}, {property.state} {property.zip_code}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Asking: <span className="font-semibold text-gray-900">
                            ${property.asking_price.toLocaleString()}
                          </span>
                        </span>
                        <span className="text-sm text-gray-600">
                          ARV: <span className="font-semibold text-gray-900">
                            ${property.arv?.toLocaleString() || 'N/A'}
                          </span>
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      property.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      property.status === 'Available' ? 'bg-green-100 text-green-800' :
                      property.status === 'Under Contract' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};
