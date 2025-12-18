import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface FilterOptions {
  states: string[];
  cities: string[];
  counties: string[];
}

export const useFilterOptions = (selectedState?: string) => {
  const [options, setOptions] = useState<FilterOptions>({
    states: [],
    cities: [],
    counties: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);

        const { data: properties } = await supabase
          .from('properties')
          .select('state, city, county')
          .eq('is_active', true);

        if (properties) {
          const states = Array.from(new Set(properties.map(p => p.state).filter(Boolean))).sort();

          let cities: string[] = [];
          let counties: string[] = [];

          if (selectedState) {
            const filtered = properties.filter(p => p.state === selectedState);
            cities = Array.from(new Set(filtered.map(p => p.city).filter(Boolean))).sort();
            counties = Array.from(new Set(filtered.map(p => p.county).filter(Boolean))).sort();
          }

          setOptions({ states, cities, counties });
        }
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [selectedState]);

  return { options, loading };
};
