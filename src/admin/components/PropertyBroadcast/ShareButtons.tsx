/**
 * ShareButtons - Action buttons for broadcast
 */

import { MessageCircle, Copy, Eye, FileText, Image, Grid3X3 } from 'lucide-react';
import { getMediaStrategy } from '../../utils/whatsappFormatter';

interface ShareButtonsProps {
  selectedCount: number;
  onPreview: () => void;
  onCopyMessage: () => void;
  disabled?: boolean;
}

export const ShareButtons = ({
  selectedCount,
  onPreview,
  onCopyMessage,
  disabled = false,
}: ShareButtonsProps) => {
  const mediaStrategy = getMediaStrategy(selectedCount);
  
  const MediaIcon = 
    mediaStrategy.type === 'single_image' ? Image :
    mediaStrategy.type === 'collage' ? Grid3X3 : FileText;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Selection Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-semibold text-lg">{selectedCount}</span>
            <span className="text-gray-500">
              {selectedCount === 1 ? 'property' : 'properties'} selected
            </span>
          </div>
          
          {selectedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              <MediaIcon size={14} />
              <span className="capitalize">{mediaStrategy.type.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onCopyMessage}
            disabled={disabled || selectedCount === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
              disabled || selectedCount === 0
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <Copy size={18} />
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            onClick={onPreview}
            disabled={disabled || selectedCount === 0}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
              disabled || selectedCount === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#25D366] hover:bg-[#128C7E] text-white'
            }`}
          >
            <MessageCircle size={18} />
            <span>Share to WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Helpful hint */}
      {selectedCount === 0 && (
        <p className="text-sm text-gray-500 mt-3 text-center sm:text-left">
          Select properties above to create a WhatsApp broadcast message
        </p>
      )}
    </div>
  );
};
