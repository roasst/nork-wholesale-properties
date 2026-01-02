import { MessageCircle, Send, Mail, Copy } from 'lucide-react';
import { Property } from '../types';
import { useState } from 'react';

interface SharePropertyProps {
  property: Property;
  className?: string;
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export const ShareProperty = ({ property, className = '' }: SharePropertyProps) => {
  const [copied, setCopied] = useState(false);

  const propertyUrl = `${window.location.origin}/property/${property.id}`;
  const shareText = `Check out this property: ${property.street_address}, ${property.city}, ${property.state} - $${property.asking_price?.toLocaleString()}`;

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + propertyUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(propertyUrl)}&text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(`Property: ${property.street_address}`)}&body=${encodeURIComponent(shareText + '\n\n' + propertyUrl)}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        title="Share on WhatsApp"
        onClick={(e) => e.stopPropagation()}
      >
        <WhatsAppIcon />
      </a>

      <a
        href={shareLinks.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        title="Share on Telegram"
        onClick={(e) => e.stopPropagation()}
      >
        <TelegramIcon />
      </a>

      <a
        href={shareLinks.email}
        className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
        title="Share via Email"
        onClick={(e) => e.stopPropagation()}
      >
        <Mail className="w-5 h-5" />
      </a>

      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleCopyLink();
        }}
        className={`p-2 ${copied ? 'bg-green-600' : 'bg-gray-200'} ${copied ? 'text-white' : 'text-gray-700'} rounded-full hover:bg-gray-300 transition-colors relative`}
        title={copied ? 'Link copied!' : 'Copy Link'}
      >
        <Copy className="w-5 h-5" />
        {copied && (
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
};
