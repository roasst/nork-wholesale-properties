/**
 * BroadcastPreview - Preview modal with message and share options
 */

import { useState, useMemo } from 'react';
import { X, Copy, Check, MessageCircle, Users, Send, FileText, Image, Grid3X3, AlertTriangle } from 'lucide-react';
import { Property } from '../../../types';
import {
  formatBroadcastMessage,
  formatCompactBroadcast,
  generateWhatsAppUrl,
  getMessageStats,
  getMediaStrategy,
} from '../../utils/whatsappFormatter';

interface BroadcastPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
}

type MessageFormat = 'detailed' | 'compact';
type ShareTarget = 'contacts' | 'group' | 'channel';

export const BroadcastPreview = ({
  isOpen,
  onClose,
  properties,
}: BroadcastPreviewProps) => {
  const [messageFormat, setMessageFormat] = useState<MessageFormat>('detailed');
  const [shareTarget, setShareTarget] = useState<ShareTarget>('contacts');
  const [copied, setCopied] = useState(false);
  const [customHeader, setCustomHeader] = useState('🏠 *WHOLESALE DEAL DROP* 🏠');
  const [customFooter, setCustomFooter] = useState('📞 Questions? Reply to this message!');

  const message = useMemo(() => {
    if (messageFormat === 'compact') {
      return formatCompactBroadcast(properties);
    }
    return formatBroadcastMessage(properties, {
      headerText: customHeader,
      footerText: customFooter,
    });
  }, [properties, messageFormat, customHeader, customFooter]);

  const stats = useMemo(() => getMessageStats(message), [message]);
  const mediaStrategy = useMemo(() => getMediaStrategy(properties.length), [properties.length]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = generateWhatsAppUrl(message);
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-[#25D366] to-[#128C7E]">
          <div className="flex items-center gap-3">
            <MessageCircle size={24} className="text-white" />
            <h2 className="text-xl font-bold text-white">WhatsApp Broadcast Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Options Panel */}
            <div className="space-y-5">
              {/* Selection Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Selection Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-2xl font-bold text-[#7CB342]">{properties.length}</div>
                    <div className="text-gray-500">Properties</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-2">
                      {mediaStrategy.type === 'single_image' && <Image size={20} className="text-blue-500" />}
                      {mediaStrategy.type === 'collage' && <Grid3X3 size={20} className="text-purple-500" />}
                      {mediaStrategy.type === 'pdf' && <FileText size={20} className="text-red-500" />}
                      <span className="font-medium text-gray-700 capitalize">{mediaStrategy.type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{mediaStrategy.description}</div>
                  </div>
                </div>
              </div>

              {/* Message Format */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Message Format</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMessageFormat('detailed')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      messageFormat === 'detailed'
                        ? 'border-[#7CB342] bg-[#7CB342]/10 text-[#7CB342]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Detailed
                  </button>
                  <button
                    onClick={() => setMessageFormat('compact')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      messageFormat === 'compact'
                        ? 'border-[#7CB342] bg-[#7CB342]/10 text-[#7CB342]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Compact
                  </button>
                </div>
              </div>

              {/* Share Target */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Share To</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShareTarget('contacts')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      shareTarget === 'contacts'
                        ? 'border-[#25D366] bg-[#25D366]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Send size={20} className={shareTarget === 'contacts' ? 'text-[#25D366]' : 'text-gray-400'} />
                    <div className="text-left">
                      <div className="font-medium">My Contacts</div>
                      <div className="text-xs text-gray-500">Choose recipients from your WhatsApp</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setShareTarget('group')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      shareTarget === 'group'
                        ? 'border-[#25D366] bg-[#25D366]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users size={20} className={shareTarget === 'group' ? 'text-[#25D366]' : 'text-gray-400'} />
                    <div className="text-left">
                      <div className="font-medium">Group Chat</div>
                      <div className="text-xs text-gray-500">Share to a group you admin</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setShareTarget('channel')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      shareTarget === 'channel'
                        ? 'border-[#25D366] bg-[#25D366]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MessageCircle size={20} className={shareTarget === 'channel' ? 'text-[#25D366]' : 'text-gray-400'} />
                    <div className="text-left">
                      <div className="font-medium">Channel Broadcast</div>
                      <div className="text-xs text-gray-500">Post to your WhatsApp Channel</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customize (only for detailed) */}
              {messageFormat === 'detailed' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Customize Message</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Header</label>
                      <input
                        type="text"
                        value={customHeader}
                        onChange={(e) => setCustomHeader(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Footer</label>
                      <input
                        type="text"
                        value={customFooter}
                        onChange={(e) => setCustomFooter(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Message Preview</h3>
                <div className={`text-sm ${stats.isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                  {stats.charCount.toLocaleString()} / 4,096 chars
                  {stats.isOverLimit && (
                    <AlertTriangle size={14} className="inline ml-1" />
                  )}
                </div>
              </div>
              
              {/* WhatsApp-style preview */}
              <div className="flex-1 bg-[#ECE5DD] rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
                <div className="bg-[#DCF8C6] rounded-lg p-3 shadow-sm max-w-[95%] ml-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 break-words">
                    {message}
                  </pre>
                  <div className="text-right text-xs text-gray-500 mt-2">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {stats.isOverLimit && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  <AlertTriangle size={14} className="inline mr-1" />
                  Message exceeds WhatsApp limit. Consider using compact format or selecting fewer properties.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {copied ? (
              <>
                <Check size={18} className="text-green-500" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={18} className="text-gray-500" />
                <span>Copy Message</span>
              </>
            )}
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={stats.isOverLimit}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                stats.isOverLimit
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#25D366] hover:bg-[#128C7E] text-white'
              }`}
            >
              <MessageCircle size={18} />
              Share to WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
