/**
 * ShareButtons - Action buttons for broadcast with collage/PDF downloads
 */

import { useState } from 'react';
import { 
  MessageCircle, Copy, FileText, Image, Grid3X3, 
  Download, Loader2, ChevronDown 
} from 'lucide-react';
import { getMediaStrategy } from '../../utils/whatsappFormatter';

interface ShareButtonsProps {
  selectedCount: number;
  onPreview: () => void;
  onCopyMessage: () => void;
  onDownloadCollage?: () => Promise<void>;
  onDownloadPDF?: () => Promise<void>;
  disabled?: boolean;
}

export const ShareButtons = ({
  selectedCount,
  onPreview,
  onCopyMessage,
  onDownloadCollage,
  onDownloadPDF,
  disabled = false,
}: ShareButtonsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  
  const mediaStrategy = getMediaStrategy(selectedCount);
  const canCollage = selectedCount >= 2 && selectedCount <= 4;
  const canPDF = selectedCount >= 1;
  
  const MediaIcon = 
    mediaStrategy.type === 'single_image' ? Image :
    mediaStrategy.type === 'collage' ? Grid3X3 : FileText;

  const handleDownloadCollage = async () => {
    if (!onDownloadCollage || isGenerating) return;
    setIsGenerating(true);
    setShowDownloadMenu(false);
    try {
      await onDownloadCollage();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!onDownloadPDF || isGenerating) return;
    setIsGenerating(true);
    setShowDownloadMenu(false);
    try {
      await onDownloadPDF();
    } finally {
      setIsGenerating(false);
    }
  };

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
          {/* Copy Button */}
          <button
            onClick={onCopyMessage}
            disabled={disabled || selectedCount === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
              disabled || selectedCount === 0
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
            title="Copy message to clipboard"
          >
            <Copy size={18} />
            <span className="hidden sm:inline">Copy</span>
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              disabled={disabled || selectedCount === 0 || isGenerating}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                disabled || selectedCount === 0 || isGenerating
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              {isGenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              <span className="hidden sm:inline">
                {isGenerating ? 'Creating...' : 'Download'}
              </span>
              <ChevronDown size={14} />
            </button>

            {/* Dropdown Menu */}
            {showDownloadMenu && !isGenerating && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDownloadMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <button
                    onClick={handleDownloadCollage}
                    disabled={!canCollage}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      canCollage 
                        ? 'hover:bg-gray-50 text-gray-700' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Grid3X3 size={18} className={canCollage ? 'text-[#7CB342]' : ''} />
                    <div>
                      <div className="font-medium">Image Collage</div>
                      <div className="text-xs text-gray-500">
                        {canCollage ? 'JPG for WhatsApp' : 'Select 2-4 properties'}
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleDownloadPDF}
                    disabled={!canPDF}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      canPDF 
                        ? 'hover:bg-gray-50 text-gray-700' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FileText size={18} className={canPDF ? 'text-[#7CB342]' : ''} />
                    <div>
                      <div className="font-medium">PDF Flyer</div>
                      <div className="text-xs text-gray-500">
                        Branded document with all details
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* WhatsApp Share Button */}
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

      {/* Helpful hints */}
      {selectedCount === 0 ? (
        <p className="text-sm text-gray-500 mt-3 text-center sm:text-left">
          Select properties above to create a WhatsApp broadcast message
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Grid3X3 size={12} />
            2-4 properties = Image collage
          </span>
          <span className="flex items-center gap-1">
            <FileText size={12} />
            Any selection = PDF flyer
          </span>
        </div>
      )}
    </div>
  );
};
