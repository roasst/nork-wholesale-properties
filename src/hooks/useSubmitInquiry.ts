import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Inquiry } from '../types';

export const useSubmitInquiry = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitInquiry = async (inquiry: Omit<Inquiry, 'id' | 'is_read' | 'created_at'>) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const { error: submitError } = await supabase
        .from('inquiries')
        .insert([
          {
            property_id: inquiry.property_id,
            property_address: inquiry.property_address,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone || null,
            message: inquiry.message || null,
            is_read: false,
          },
        ]);

      if (submitError) throw submitError;

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const resetStatus = () => {
    setSuccess(false);
    setError(null);
  };

  return { submitInquiry, submitting, error, success, resetStatus };
};
