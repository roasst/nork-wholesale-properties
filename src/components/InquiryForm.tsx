import { useState, FormEvent, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Property } from '../types';
import { useSubmitInquiry } from '../hooks/useSubmitInquiry';
import { BRANDING } from '../config/branding';

interface InquiryFormProps {
  property: Property;
}

export const InquiryForm = ({ property }: InquiryFormProps) => {
  const { submitInquiry, submitting, error, success, resetStatus } = useSubmitInquiry();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const fullAddress = `${property.street_address}, ${property.city}, ${property.state} ${property.zip_code}`;

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', message: '' });
        resetStatus();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, resetStatus]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await submitInquiry({
      property_id: property.id,
      property_address: fullAddress,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      message: formData.message || undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (success || error) resetStatus();
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Interested in this property?</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-white font-bold py-4 px-6 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
          style={{ backgroundColor: submitting ? '#9CA3AF' : BRANDING.accentColor }}
          onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = BRANDING.accentColorHover)}
          onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = BRANDING.accentColor)}
        >
          {submitting && <Loader2 className="animate-spin" size={20} />}
          {submitting ? 'Sending...' : 'Submit Inquiry'}
        </button>

        {success && (
          <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg flex items-start gap-3 animate-fade-in">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
            <p className="text-green-800 font-semibold">Inquiry sent! We'll be in touch soon.</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg flex items-start gap-3 animate-fade-in">
            <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};
