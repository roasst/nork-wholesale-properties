import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface TrustedToggleProps {
  isTrusted: boolean;
  onChange: (value: boolean) => Promise<void>;
  disabled?: boolean;
}

export const TrustedToggle = ({ isTrusted, onChange, disabled = false }: TrustedToggleProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    if (disabled || isChanging) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsChanging(true);
    try {
      await onChange(!isTrusted);
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to toggle trusted status:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggle}
        disabled={disabled || isChanging}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isTrusted ? 'bg-green-600' : 'bg-gray-300'
        } ${disabled || isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isTrusted ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      {showConfirm && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64 z-50">
          <p className="text-sm text-gray-700 mb-3">
            {isTrusted
              ? 'Remove trusted status? Future deals will require approval.'
              : 'Mark as trusted? Future deals from this sender will be published automatically.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={isChanging}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              <Check size={16} />
              Confirm
            </button>
            <button
              onClick={handleCancel}
              disabled={isChanging}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
