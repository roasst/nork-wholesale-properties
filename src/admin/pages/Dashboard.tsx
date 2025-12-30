import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, CheckCircle, DollarSign, Plus, Eye, Inbox } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { StatsCard } from '../components/StatsCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Inquiry } from '../types';

export const Dashboard = () => {
  const { profile } = useAuth();
  const { success } = useToast();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    underContract: 0,
    sold: 0,
    totalInquiries: 0,
    unreadInquiries: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    if (location.state && (location.state as { fromLogin?: boolean }).fromLogin && profile) {
      success(`Welcome back, ${profile.full_name || 'User'}!`);
      window.history.replaceState({}, document.title);
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      const [propertiesResult, inquiriesResult, recentInquiriesResult] = await Promise.all([
        supabase.from('properties').select('status, is_active', { count: 'exact' }),
        supabase.from('inquiries').select('marked_read_at', { count: 'exact' }).eq('is_deleted', false),
        supabase
          .from('inquiries')
          .select('*, property:properties(street_address, city, state)')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (propertiesResult.data) {
        const totalProperties = propertiesResult.data.length;
        const activeProperties = propertiesResult.data.filter((p) => p.is_active).length;
        const underContract = propertiesResult.data.filter((p) => p.status === 'Under Contract').length;
        const sold = propertiesResult.data.filter((p) => p.status === 'Sold').length;

        setStats((prev) => ({
          ...prev,
          totalProperties,
          activeProperties,
          underContract,
          sold,
        }));
      }

      if (inquiriesResult.data) {
        const unreadInquiries = inquiriesResult.data.filter((i) => !i.marked_read_at).length;
        setStats((prev) => ({
          ...prev,
          totalInquiries: inquiriesResult.data.length,
          unreadInquiries,
        }));
      }

      if (recentInquiriesResult.data) {
        setRecentInquiries(recentInquiriesResult.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'Admin'}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your properties today.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Active Properties"
              value={stats.activeProperties}
              icon={Home}
              subtitle={`${stats.totalProperties} total`}
            />
            <StatsCard
              title="Total Inquiries"
              value={stats.totalInquiries}
              icon={MessageSquare}
              subtitle={`${stats.unreadInquiries} unread`}
              color="#3B82F6"
            />
            <StatsCard
              title="Under Contract"
              value={stats.underContract}
              icon={CheckCircle}
              subtitle="Pending sales"
              color="#F59E0B"
            />
            <StatsCard
              title="Sold"
              value={stats.sold}
              icon={DollarSign}
              subtitle="Completed deals"
              color="#10B981"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Inquiries</h2>
              <Link
                to="/admin/inquiries"
                className="text-sm text-[#7CB342] hover:text-[#689F38] font-medium"
              >
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border-b border-gray-200 pb-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentInquiries.length > 0 ? (
              <div className="space-y-4">
                {recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{inquiry.name}</p>
                        <p className="text-sm text-gray-600">{inquiry.email}</p>
                      </div>
                      {!inquiry.marked_read_at && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Unread
                        </span>
                      )}
                    </div>
                    {inquiry.property && (
                      <p className="text-sm text-gray-600">
                        {inquiry.property.street_address}, {inquiry.property.city}, {inquiry.property.state}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(inquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Inbox size={48} className="mx-auto mb-2 opacity-50" />
                <p>No inquiries yet</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/admin/properties/new"
                className="flex items-center gap-3 p-4 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span className="font-medium">Add New Property</span>
              </Link>
              <Link
                to="/admin/properties"
                className="flex items-center gap-3 p-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors"
              >
                <Eye size={20} />
                <span className="font-medium">View All Properties</span>
              </Link>
              <Link
                to="/admin/inquiries"
                className="flex items-center gap-3 p-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors"
              >
                <MessageSquare size={20} />
                <span className="font-medium">Manage Inquiries</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
