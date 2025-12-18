import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Property, PropertyFilters } from '../types';

export const useProperties = (filters?: PropertyFilters, limit?: number) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('properties')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (filters?.state) {
          query = query.eq('state', filters.state);
        }

        if (filters?.city) {
          query = query.eq('city', filters.city);
        }

        if (filters?.county) {
          query = query.eq('county', filters.county);
        }

        if (filters?.zip_code) {
          query = query.eq('zip_code', filters.zip_code);
        }

        if (filters?.minPrice) {
          query = query.gte('asking_price', filters.minPrice);
        }

        if (filters?.maxPrice) {
          query = query.lte('asking_price', filters.maxPrice);
        }

        if (filters?.propertyTypes && filters.propertyTypes.length > 0) {
          query = query.in('property_type', filters.propertyTypes);
        }

        if (limit) {
          query = query.limit(limit);
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

    fetchProperties();
  }, [filters?.state, filters?.city, filters?.county, filters?.zip_code, filters?.minPrice, filters?.maxPrice, filters?.propertyTypes?.join(','), limit]);

  return { properties, loading, error };
};
