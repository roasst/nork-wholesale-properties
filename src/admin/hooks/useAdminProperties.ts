import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Property, PropertyStatus } from '../../types';

interface AdminPropertyFilters {
  status?: PropertyStatus | 'all';
  is_active?: boolean;
  wholesaler_id?: string;
}

export const useAdminProperties = (filters?: AdminPropertyFilters) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchProperties();
    fetchPendingCount();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('properties')
        .select('*, wholesalers(name, email, company_name)')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters?.wholesaler_id) {
        query = query.eq('wholesaler_id', filters.wholesaler_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setProperties(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (countError) throw countError;

      setPendingCount(count || 0);
    } catch (err) {
      console.error('Failed to fetch pending count:', err);
    }
  };

  return {
    properties,
    loading,
    error,
    pendingCount,
    refetch: fetchProperties,
  };
};

export const approveProperty = async (id: string) => {
  const { error } = await supabase
    .from('properties')
    .update({ status: 'Available' })
    .eq('id', id);

  if (error) throw error;
};

export const rejectProperty = async (id: string, userId: string) => {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const approveAndTrustSender = async (propertyId: string, wholesalerId: string) => {
  const { error: approveError } = await supabase
    .from('properties')
    .update({ status: 'Available' })
    .eq('id', propertyId);

  if (approveError) throw approveError;

  const { error: trustError } = await supabase
    .from('wholesalers')
    .update({ is_trusted: true })
    .eq('id', wholesalerId);

  if (trustError) throw trustError;
};
