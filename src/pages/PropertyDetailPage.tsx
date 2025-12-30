import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Bed, Bath, Square, Phone, MessageCircle, Send, CreditCard } from 'lucide-react';
import { useProperty } from '../hooks/useProperty';
import { formatCurrency, getStatusColor } from '../lib/utils';
import { InquiryForm } from '../components/InquiryForm';
import { MobileCTABar } from '../components/MobileCTABar';
import { ComingSoonModal } from '../components/ComingSoonModal';
import { CONTACT_INFO } from '../config/contact';
import { IMAGES } from '../config/branding';

export const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { property, loading, error } = useProperty(id);
  const [showFundingModal, setShowFundingModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-24 mb-6" />
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-[16/9] bg-gray-300" />
              <div className="p-6 space-y-4">
                <div className="h-10 bg-gray-300 rounded w-48" />
                <div className="h-6 bg-gray-200 rounded w-full" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-800 font-medium text-xl mb-4">
              {error || 'Property not found'}
            </p>
            <Link to="/properties" className="text-blue-600 hover:text-blue-700 font-semibold">
              View All Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fullAddress = `${property.street_address}, ${property.city}, ${property.state} ${property.zip_code}`;

  const handleCall = () => {
    window.location.href = `tel:${CONTACT_INFO.phone}`;
  };

  const handleWhatsApp = () => {
    window.location.href = CONTACT_INFO.whatsapp;
  };

  const handleTelegram = () => {
    window.location.href = CONTACT_INFO.telegram;
  };

  const handleGetFunding = () => {
    if (CONTACT_INFO.getFundingUrl) {
      window.open(CONTACT_INFO.getFundingUrl, '_blank');
    } else {
      setShowFundingModal(true);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
        <div className="container mx-auto px-4 py-6">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Properties
          </Link>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative aspect-[16/9] bg-[#F5F5F5]">
              <img
                src={property.image_url || IMAGES.placeholder}
                onError={(e) => { e.currentTarget.src = IMAGES.placeholder; }}
                alt={property.image_url ? fullAddress : 'Property image coming soon'}
                className="w-full h-full object-cover opacity-0 transition-opacity duration-200"
                onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
              />
              <div className="absolute top-4 right-4">
                <span className={`${getStatusColor(property.status)} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg`}>
                  {property.status}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      <span translate="no">{property.street_address}</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      <span translate="no">{property.city}, {property.county} County, {property.state} {property.zip_code}</span>
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 md:p-6 rounded-lg mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <p className="text-xs md:text-sm text-gray-600 mb-1">Asking Price</p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-words">{formatCurrency(property.asking_price)}</p>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-600 mb-1">ARV</p>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-words">{formatCurrency(property.arv)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Property Type</p>
                      <p className="text-lg font-semibold text-gray-900">{property.property_type}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Bed size={16} className="text-gray-600" />
                        <p className="text-xs text-gray-600">Bedrooms</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{property.bedrooms}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Bath size={16} className="text-gray-600" />
                        <p className="text-xs text-gray-600">Bathrooms</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{property.bathrooms}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Square size={16} className="text-gray-600" />
                        <p className="text-xs text-gray-600">Square Footage</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{property.square_footage.toLocaleString()} sqft</p>
                    </div>
                  </div>

                  {property.comments && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div
                          className="prose prose-sm max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: property.comments }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="hidden lg:block">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Options</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={handleCall}
                        className="flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                        style={{ backgroundColor: '#7CB342' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#689F38'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7CB342'}
                      >
                        <Phone size={20} />
                        Call Now
                      </button>
                      <button
                        onClick={handleWhatsApp}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                      >
                        <MessageCircle size={20} />
                        WhatsApp
                      </button>
                      <button
                        onClick={handleTelegram}
                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                      >
                        <Send size={20} />
                        Telegram
                      </button>
                      <button
                        onClick={handleGetFunding}
                        className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                      >
                        <CreditCard size={20} />
                        Get Funding
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <InquiryForm property={property} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileCTABar onGetFundingClick={handleGetFunding} />
      <ComingSoonModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
    </>
  );
};
