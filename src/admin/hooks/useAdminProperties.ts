import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Property, PropertyStatus } from '../../types';

interface AdminPropertyFilters {
  status?: PropertyStatus | 'all';
  is_active?: boolean;
  wholesaler_id?: string;
}

// Extended property type with additional wholesaler count
export interface AdminProperty extends Property {
  wholesalers?: {
    name: string;
    email: string;
    company_name: string | null;
  } | null;
  additional_wholesaler_count?: number;
}

export const useAdminProperties = (filters?: AdminPropertyFilters) => {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const statusFilter = filters?.status;
  const isActiveFilter = filters?.is_active;
  const wholesalerIdFilter = filters?.wholesaler_id;

  useEffect(() => {
    fetchProperties();
    fetchPendingCount();
  }, [statusFilter, isActiveFilter, wholesalerIdFilter]);

  const fetchProperties = async () => {
    try {
      console.log('Fetching properties...', { statusFilter, isActiveFilter, wholesalerIdFilter });
      setLoading(true);
      setError(null);

      let query = supabase
        .from('properties')
        .select('*, wholesalers(name, email, company_name)')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (isActiveFilter !== undefined) {
        query = query.eq('is_active', isActiveFilter);
      }

      if (wholesalerIdFilter) {
        query = query.eq('wholesaler_id', wholesalerIdFilter);
      }

      const { data, error: fetchError } = await query;

      console.log('Properties result:', { count: data?.length, error: fetchError });

      if (fetchError) throw fetchError;

      // Fetch additional wholesaler counts for all properties
      if (data && data.length > 0) {
        const propertyIds = data.map(p => p.id);
        
        const { data: wholesalerCounts, error: countError } = await supabase
          .from('property_wholesalers')
          .select('property_id')
          .in('property_id', propertyIds);

        if (!countError && wholesalerCounts) {
          // Count occurrences per property_id
          const countMap: Record<string, number> = {};
          wholesalerCounts.forEach(item => {
            countMap[item.property_id] = (countMap[item.property_id] || 0) + 1;
          });

          // Merge counts into properties
          const propertiesWithCounts = data.map(property => ({
            ...property,
            additional_wholesaler_count: countMap[property.id] || 0,
          }));

          setProperties(propertiesWithCounts);
        } else {
          setProperties(data || []);
        }
      } else {
        setProperties(data || []);
      }
    } catch (err) {
      console.error('Properties fetch error:', err);
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
    .update({ status: 'Available', is_active: true })
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
    .update({ status: 'Available', is_active: true })
    .eq('id', propertyId);

  if (approveError) throw approveError;

  const { error: trustError } = await supabase
    .from('wholesalers')
    .update({ is_trusted: true })
    .eq('id', wholesalerId);

  if (trustError) throw trustError;
};
