import { Mail, Phone, Building2 } from 'lucide-react';
import { Wholesaler } from '../../types';

interface WholesalerCardProps {
  wholesaler: Wholesaler;
  onViewDeals?: () => void;
}

export const WholesalerCard = ({ wholesaler, onViewDeals }: WholesalerCardProps) => {
  const handleEmail = () => {
    window.location.href = `mailto:${wholesaler.email}`;
  };

  const handleCall = () => {
    if (wholesaler.phone) {
      window.location.href = `tel:${wholesaler.phone}`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-white border-2 border-[#7CB342] rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#7CB342] flex items-center justify-center text-white font-bold text-lg">
          {wholesaler.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{wholesaler.name}</h3>
          {wholesaler.company_name && (
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Building2 size={16} />
              <span className="text-sm">{wholesaler.company_name}</span>
            </div>
          )}
        </div>
        {wholesaler.is_trusted && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
            TRUSTED
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={handleEmail}
          className="w-full flex items-center gap-2 text-left text-gray-700 hover:text-[#7CB342] transition-colors"
        >
          <Mail size={16} />
          <span className="text-sm">{wholesaler.email}</span>
        </button>

        {wholesaler.phone && (
          <button
            onClick={handleCall}
            className="w-full flex items-center gap-2 text-left text-gray-700 hover:text-[#7CB342] transition-colors"
          >
            <Phone size={16} />
            <span className="text-sm">{wholesaler.phone}</span>
          </button>
        )}
      </div>

      {onViewDeals && (
        <button
          onClick={onViewDeals}
          className="w-full py-2 px-4 bg-[#7CB342] hover:bg-[#689F38] text-white font-medium rounded-lg transition-colors"
        >
          View All Deals ({wholesaler.total_deals})
        </button>
      )}
    </div>
  );
};
