/**
 * WhatsApp Message Formatter
 * Formats property data for WhatsApp broadcasts
 */

import { Property } from '../../types';

// Site URL for property links
const SITE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'https://norkwholesale.com';

/**
 * Generate a cache-busting property URL
 * WhatsApp aggressively caches link previews, so we add a timestamp
 * to force it to fetch fresh OG tags for each share
 */
function getPropertyUrl(propertyId: string): string {
  const timestamp = Date.now();
  return `${SITE_URL}/property/${propertyId}?v=${timestamp}`;
}

/**
 * Format a single property for WhatsApp
 */
export function formatPropertyBlock(property: Property): string {
  const {
    street_address,
    city,
    state,
    zip_code,
    county,
    asking_price,
    arv,
    bedrooms,
    bathrooms,
    square_footage,
    property_type,
    id,
  } = property;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(asking_price);

  const formattedArv = arv
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(arv)
    : null;

  const sqftFormatted = square_footage
    ? new Intl.NumberFormat('en-US').format(square_footage)
    : null;

  // Use cache-busting URL
  const propertyUrl = getPropertyUrl(id);

  const lines = [
    `🔥 *${street_address}, ${city}, ${state} ${zip_code}*`,
    `💰 Asking: ${formattedPrice}${formattedArv ? ` | ARV: ${formattedArv}` : ''}`,
    `🛏 ${bedrooms} BD | ${bathrooms} BA${sqftFormatted ? ` | ${sqftFormatted} sqft` : ''} | ${property_type}`,
    `📍 ${county} County`,
    `🔗 ${propertyUrl}`,
  ];

  return lines.join('\n');
}

/**
 * Format multiple properties for WhatsApp broadcast
 */
export function formatBroadcastMessage(
  properties: Property[],
  options?: {
    headerText?: string;
    footerText?: string;
    includeTimestamp?: boolean;
  }
): string {
  const {
    headerText = '🏠 *WHOLESALE DEAL DROP* 🏠',
    footerText = '📞 Questions? Reply to this message!',
    includeTimestamp = true,
  } = options || {};

  const divider = '━━━━━━━━━━━━━━━━━━━━━';
  const propertyBlocks = properties.map(formatPropertyBlock);

  const messageParts = [
    headerText,
    divider,
    '',
    propertyBlocks.join(`\n\n${divider}\n\n`),
    '',
    divider,
  ];

  if (footerText) {
    messageParts.push(footerText);
  }

  if (includeTimestamp) {
    const timestamp = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    messageParts.push(`\n📅 ${timestamp}`);
  }

  return messageParts.join('\n');
}

/**
 * Generate wa.me URL with pre-filled message
 * @param message - The formatted message
 * @param phoneNumber - Optional recipient phone number (with country code, no +)
 */
export function generateWhatsAppUrl(message: string, phoneNumber?: string): string {
  const encodedMessage = encodeURIComponent(message);
  
  if (phoneNumber) {
    // Remove any non-numeric characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  }
  
  // No phone number = user picks from their contacts
  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp group/channel share URL
 * Note: This opens WhatsApp and lets user select where to share
 */
export function generateWhatsAppShareUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Calculate estimated character count
 * WhatsApp has soft limits around 4096 characters
 */
export function getMessageStats(message: string): {
  charCount: number;
  isOverLimit: boolean;
  percentUsed: number;
} {
  const MAX_CHARS = 4096;
  const charCount = message.length;
  
  return {
    charCount,
    isOverLimit: charCount > MAX_CHARS,
    percentUsed: Math.round((charCount / MAX_CHARS) * 100),
  };
}

/**
 * Get recommended media strategy based on property count
 */
export function getMediaStrategy(propertyCount: number): {
  type: 'single_image' | 'collage' | 'pdf';
  description: string;
} {
  if (propertyCount === 1) {
    return {
      type: 'single_image',
      description: 'Single property image',
    };
  } else if (propertyCount >= 2 && propertyCount <= 4) {
    return {
      type: 'collage',
      description: `${propertyCount}-image collage grid`,
    };
  } else {
    return {
      type: 'pdf',
      description: 'Auto-generated PDF deal sheet',
    };
  }
}

/**
 * Truncate message if too long, with smart splitting
 */
export function truncateMessage(message: string, maxChars: number = 4000): string {
  if (message.length <= maxChars) {
    return message;
  }
  
  // Find a good break point (end of a property block)
  const divider = '━━━━━━━━━━━━━━━━━━━━━';
  const truncated = message.substring(0, maxChars);
  const lastDividerIndex = truncated.lastIndexOf(divider);
  
  if (lastDividerIndex > maxChars / 2) {
    return truncated.substring(0, lastDividerIndex + divider.length) + 
      '\n\n⚠️ _Message truncated. See full list on our website._';
  }
  
  return truncated + '\n\n⚠️ _Message truncated._';
}

/**
 * Format a compact version for shorter messages
 */
export function formatCompactProperty(property: Property): string {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.asking_price);

  // Use cache-busting URL
  return `• *${property.street_address}*, ${property.city} - ${formattedPrice}`;
}

/**
 * Format compact broadcast for many properties
 */
export function formatCompactBroadcast(properties: Property[]): string {
  const header = `🏠 *${properties.length} NEW DEALS* 🏠\n\n`;
  const compactList = properties.map(formatCompactProperty).join('\n');
  const footer = `\n\n🔗 View all: ${SITE_URL}/properties\n📞 Reply for details!`;
  
  return header + compactList + footer;
}
