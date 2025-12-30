import { useState } from 'react';
import { Check, X, Edit, Mail, Building2, AlertCircle } from 'lucide-react';
import { Property, Wholesaler } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { IMAGES } from '../../config/branding';
import { approveProperty, rejectProperty, approveAndTrustSender } from '../hooks/useAdminProperties';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface PendingPropertyCardProps {
  property: Property & { wholesalers?: Wholesaler };
  onUpdate: () => void;
}

export const PendingPropertyCard = ({ property, onUpdate }: PendingPropertyCardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await approveProperty(property.id);
      success('Property approved successfully!');
      onUpdate();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to approve property');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject and delete this property?')) {
      return;
    }

    try {
      setIsProcessing(true);
      await rejectProperty(property.id, '');
      success('Property rejected and deleted');
      onUpdate();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reject property');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAndTrust = async () => {
    if (!property.wholesaler_id) return;

    if (!window.confirm('Approve this property AND mark the sender as trusted? Future deals will auto-publish.')) {
      return;
    }

    try {
      setIsProcessing(true);
      await approveAndTrustSender(property.id, property.wholesaler_id);
      success('Property approved and sender marked as trusted!');
      onUpdate();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/properties/edit/${property.id}`);
  };

  const wholesaler = property.wholesalers;

  return (
    <div className="bg-white border-2 border-amber-400 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <AlertCircle size={14} />
            PENDING REVIEW
          </span>
        </div>
        {property.auto_imported && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
              AUTO-IMPORTED
            </span>
          </div>
        )}
        <div className="aspect-[16/9] bg-gray-200">
          <img
            src={property.image_url || IMAGES.placeholder}
            alt={property.street_address}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = IMAGES.placeholder;
            }}
          />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {property.street_address}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {property.city}, {property.state} {property.zip_code}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">Asking Price</p>
            <p className="text-xl font-bold text-[#7CB342]">{formatCurrency(property.asking_price)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ARV</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(property.arv)}</p>
          </div>
        </div>

        {wholesaler && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Mail size={16} className="text-gray-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">From Wholesaler</p>
                <p className="text-sm font-semibold text-gray-900">{wholesaler.name}</p>
                {wholesaler.company_name && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                    <Building2 size={12} />
                    {wholesaler.company_name}
                  </div>
                )}
                <p className="text-xs text-gray-600 truncate">{wholesaler.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Check size={18} />
            Approve
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={18} />
            Reject
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleEdit}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Edit size={16} />
            Edit
          </button>
          {property.wholesaler_id && (
            <button
              onClick={handleApproveAndTrust}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-[#7CB342] hover:bg-[#689F38] text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Trust Sender
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
