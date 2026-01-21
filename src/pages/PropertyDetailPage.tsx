import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Bed, Bath, Square, Phone, MessageCircle, Send, CreditCard, Share2 } from 'lucide-react';
import { useProperty } from '../hooks/useProperty';
import { formatCurrency, getStatusColor, getPublicStatusLabel } from '../lib/utils';
import { InquiryForm } from '../components/InquiryForm';
import { MobileCTABar } from '../components/MobileCTABar';
import { ComingSoonModal } from '../components/ComingSoonModal';
import { ShareProperty } from '../components/ShareProperty';
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 aspect-[4/3] bg-gray-300 rounded-lg" />
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-8 bg-gray-300 rounded w-3/4" />
                  <div className="h-10 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
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
            <div className="p-4 md:p-6">
              {/* Desktop: Image + Form side by side | Mobile: Stacked */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                {/* Image - Left side on desktop */}
                <div className="lg:col-span-3">
                  <div className="relative aspect-[4/3] bg-[#F5F5F5] rounded-lg overflow-hidden">
                    <img
                      src={property.image_url || IMAGES.placeholder}
                      onError={(e) => { e.currentTarget.src = IMAGES.placeholder; }}
                      alt={property.image_url ? fullAddress : 'Property image coming soon'}
                      className="w-full h-full object-cover opacity-0 transition-opacity duration-200"
                      onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`${getStatusColor(property.status)} text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                        {getPublicStatusLabel(property.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inquiry Form - Right side on desktop */}
                <div className="lg:col-span-2">
                  <InquiryForm property={property} />
                </div>
              </div>

              {/* Property Details - Full width below */}
              <div className="space-y-6">
                {/* Address */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    <span translate="no">{property.street_address}</span>
                  </h1>
                  <p className="text-lg text-gray-600">
                    <span translate="no">{property.city}, {property.county} County, {property.state} {property.zip_code}</span>
                  </p>
                </div>

                {/* Price Section */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 md:p-5 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Asking Price</p>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(property.asking_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">ARV (After Repair Value)</p>
                      {property.arv && property.arv > 0 ? (
                        <p className="text-2xl md:text-3xl font-bold text-green-600">{formatCurrency(property.arv)}</p>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-700 mb-2">Not yet analyzed</p>
                          <a
                            href="#contact"
                            className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            📊 Request Free ARV Analysis
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Property Type</p>
                    <p className="text-base font-semibold text-gray-900">{property.property_type}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bed size={14} className="text-gray-600" />
                      <p className="text-xs text-gray-600">Bedrooms</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{property.bedrooms}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bath size={14} className="text-gray-600" />
                      <p className="text-xs text-gray-600">Bathrooms</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{property.bathrooms}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Square size={14} className="text-gray-600" />
                      <p className="text-xs text-gray-600">Square Footage</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{property.square_footage.toLocaleString()} sqft</p>
                  </div>
                </div>

                {/* Property Comments */}
                {property.comments && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Property Details</h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: property.comments }}
                      />
                    </div>
                  </div>
                )}

                {/* Share Section */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Share2 className="text-gray-600" size={18} />
                    <h3 className="text-base font-semibold text-gray-900">Share This Property</h3>
                  </div>
                  <ShareProperty property={property} />
                </div>

                {/* Contact Options - Desktop only */}
                <div className="hidden lg:block">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Options</h2>
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={handleCall}
                      className="flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      style={{ backgroundColor: '#7CB342' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#689F38'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7CB342'}
                    >
                      <Phone size={18} />
                      Call Now
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </button>
                    <button
                      onClick={handleTelegram}
                      className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      <Send size={18} />
                      Telegram
                    </button>
                    <button
                      onClick={handleGetFunding}
                      className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      <CreditCard size={18} />
                      Get Funding
                    </button>
                  </div>
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
