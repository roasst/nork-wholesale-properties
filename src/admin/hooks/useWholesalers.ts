import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Wholesaler } from '../../types';

interface WholesalersFilters {
  search?: string;
  trusted?: boolean;
}

export const useWholesalers = (filters?: WholesalersFilters) => {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchTerm = filters?.search;
  const trustedFilter = filters?.trusted;

  useEffect(() => {
    fetchWholesalers();
  }, [searchTerm, trustedFilter]);

  const fetchWholesalers = async () => {
    try {
      console.log('Fetching wholesalers...', { searchTerm, trustedFilter });
      setLoading(true);
      setError(null);

      let query = supabase
        .from('wholesalers')
        .select('*')
        .order('total_deals', { ascending: false });

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        query = query.or(`name.ilike.${searchPattern},email.ilike.${searchPattern},company_name.ilike.${searchPattern}`);
      }

      if (trustedFilter !== undefined) {
        query = query.eq('is_trusted', trustedFilter);
      }

      const { data, error: fetchError } = await query;

      console.log('Wholesalers result:', { count: data?.length, error: fetchError });

      if (fetchError) throw fetchError;

      setWholesalers(data || []);
    } catch (err) {
      console.error('Wholesalers fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wholesalers');
    } finally {
      setLoading(false);
    }
  };

  return {
    wholesalers,
    loading,
    error,
    refetch: fetchWholesalers,
  };
};

export const useWholesaler = (id: string | undefined) => {
  const [wholesaler, setWholesaler] = useState<Wholesaler | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchWholesaler();
    }
  }, [id]);

  const fetchWholesaler = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('wholesalers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Wholesaler not found');

      setWholesaler(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wholesaler');
    } finally {
      setLoading(false);
    }
  };

  return {
    wholesaler,
    loading,
    error,
    refetch: fetchWholesaler,
  };
};

export const updateWholesaler = async (id: string, data: Partial<Wholesaler>) => {
  const { error } = await supabase
    .from('wholesalers')
    .update(data)
    .eq('id', id);

  if (error) throw error;
};

export const toggleTrusted = async (id: string, currentValue: boolean) => {
  const { error } = await supabase
    .from('wholesalers')
    .update({ is_trusted: !currentValue })
    .eq('id', id);

  if (error) throw error;
};

export const deleteWholesaler = async (id: string) => {
  const { error } = await supabase
    .from('wholesalers')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
