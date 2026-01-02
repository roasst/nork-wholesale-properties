import { useState, useEffect } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../context/ToastContext';

interface PropertyStats {
  total_properties: number;
  visible_properties: number;
  hidden_properties: number;
  pending_review: number;
  pending_visible: number;
  pending_with_image: number;
  needs_image: number;
}

export const BulkApproveSection = ({ onRefresh }: { onRefresh: () => void }) => {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('property_stats')
        .select('*')
        .single();

      if (error) throw error;
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleBulkApprove = async (type: 'all' | 'visible' | 'with_images') => {
    const confirmMessages = {
      all: `Approve all ${stats?.pending_review || 0} pending properties?`,
      visible: `Approve ${stats?.pending_visible || 0} visible pending properties?`,
      with_images: `Approve ${stats?.pending_with_image || 0} pending properties that have images?`
    };

    if (!confirm(confirmMessages[type])) {
      return;
    }

    setLoading(true);
    try {
      let result;

      switch (type) {
        case 'all':
          const { data: allCount, error: allError } = await supabase.rpc('approve_all_pending_properties');
          if (allError) throw allError;
          result = allCount;
          break;

        case 'visible':
          const { data: visibleCount, error: visibleError } = await supabase.rpc('approve_visible_pending_properties');
          if (visibleError) throw visibleError;
          result = visibleCount;
          break;

        case 'with_images':
          const { data: imageCount, error: imageError } = await supabase.rpc('approve_pending_with_images');
          if (imageError) throw imageError;
          result = imageCount;
          break;
      }

      success(`Approved ${result} ${result === 1 ? 'property' : 'properties'}!`);
      await fetchStats();
      onRefresh();
    } catch (err) {
      console.error('Bulk approve error:', err);
      showError('Failed to approve properties: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return null;
  }

  if (stats.pending_review === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="text-green-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">Bulk Approve Pending Properties</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-3xl font-bold text-yellow-700">{stats.pending_review}</p>
          <p className="text-sm text-yellow-600 mt-1">Total Pending</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-3xl font-bold text-green-700">{stats.pending_visible}</p>
          <p className="text-sm text-green-600 mt-1">Pending & Visible</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-3xl font-bold text-blue-700">{stats.pending_with_image}</p>
          <p className="text-sm text-blue-600 mt-1">Pending with Images</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleBulkApprove('all')}
          disabled={loading || stats.pending_review === 0}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
          Approve All Pending ({stats.pending_review})
        </button>

        <button
          onClick={() => handleBulkApprove('visible')}
          disabled={loading || stats.pending_visible === 0}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
          Approve Visible Only ({stats.pending_visible})
        </button>

        <button
          onClick={() => handleBulkApprove('with_images')}
          disabled={loading || stats.pending_with_image === 0}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
          Approve With Images ({stats.pending_with_image})
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        💡 Tip: "Approve Visible Only" approves pending properties that have images and are already visible on the website.
      </p>
    </div>
  );
};
