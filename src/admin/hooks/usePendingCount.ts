import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const usePendingCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const { count: pendingCount, error } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (error) {
          console.error('Failed to fetch pending count:', error);
          return;
        }

        setCount(pendingCount || 0);
      } catch (err) {
        console.error('Failed to fetch pending count:', err);
      }
    };

    fetchPendingCount();

    const interval = setInterval(fetchPendingCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return count;
};
