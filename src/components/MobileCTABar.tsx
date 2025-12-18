import { Phone, MessageCircle, Send, CreditCard } from 'lucide-react';
import { CONTACT_INFO } from '../config/contact';

interface MobileCTABarProps {
  onGetFundingClick: () => void;
}

export const MobileCTABar = ({ onGetFundingClick }: MobileCTABarProps) => {
  const handleCall = () => {
    window.location.href = `tel:${CONTACT_INFO.phone}`;
  };

  const handleWhatsApp = () => {
    window.location.href = CONTACT_INFO.whatsapp;
  };

  const handleTelegram = () => {
    window.location.href = CONTACT_INFO.telegram;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-50">
      <div className="grid grid-cols-2 gap-2 p-3">
        <button
          onClick={handleCall}
          className="flex flex-col items-center justify-center gap-1 text-white py-3 rounded-lg transition-colors active:scale-95"
          style={{ backgroundColor: '#7CB342' }}
        >
          <Phone size={20} />
          <span className="text-xs font-semibold">Call</span>
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center gap-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors active:scale-95"
        >
          <MessageCircle size={20} />
          <span className="text-xs font-semibold">WhatsApp</span>
        </button>

        <button
          onClick={handleTelegram}
          className="flex flex-col items-center justify-center gap-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors active:scale-95"
        >
          <Send size={20} />
          <span className="text-xs font-semibold">Telegram</span>
        </button>

        <button
          onClick={onGetFundingClick}
          className="flex flex-col items-center justify-center gap-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors active:scale-95"
        >
          <CreditCard size={20} />
          <span className="text-xs font-semibold">Get Funding</span>
        </button>
      </div>
    </div>
  );
};
