/**
 * Netlify Edge Function: Dynamic OG Meta Tags for Property Pages
 * 
 * This function intercepts requests to /property/:id from social media crawlers
 * and returns HTML with proper Open Graph tags so link previews show
 * the correct property image, title, and description.
 * 
 * Regular users are passed through to the React SPA.
 */

import type { Context } from "https://edge.netlify.com";

// Bot user agents that need OG tags
const BOT_USER_AGENTS = [
  'WhatsApp',
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
  'Applebot',
  'Embedly',
  'Quora Link Preview',
  'Showyoubot',
  'outbrain',
  'vkShare',
  'W3C_Validator',
];

// Check if request is from a bot
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_USER_AGENTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

// Extract property ID from URL path
function extractPropertyId(pathname: string): string | null {
  const match = pathname.match(/^\/property\/([a-zA-Z0-9-]+)$/);
  return match ? match[1] : null;
}

// Format price as currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

// Fetch property from Supabase
async function fetchProperty(id: string, supabaseUrl: string, supabaseKey: string) {
  const url = `${supabaseUrl}/rest/v1/properties?id=eq.${id}&select=*`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Supabase fetch error:', response.status);
    return null;
  }

  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}

// Generate HTML with OG tags
function generateOGHtml(property: any, siteUrl: string): string {
  const {
    id,
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
    image_url,
    comments,
  } = property;

  // Build title and description
  const title = `${street_address}, ${city}, ${state} ${zip_code} | ${formatPrice(asking_price)}`;
  const description = [
    `💰 Asking: ${formatPrice(asking_price)}`,
    arv ? `ARV: ${formatPrice(arv)}` : null,
    `🛏 ${bedrooms} BD | ${bathrooms} BA`,
    square_footage ? `${square_footage.toLocaleString()} sqft` : null,
    `📍 ${county} County`,
    property_type,
  ].filter(Boolean).join(' | ');

  // Use property image or fallback to default OG image
  const ogImage = image_url || `${siteUrl}/og-image.svg`;
  const propertyUrl = `${siteUrl}/property/${id}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${propertyUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Nork Wholesale Properties">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${propertyUrl}">
  <meta property="twitter:title" content="${escapeHtml(title)}">
  <meta property="twitter:description" content="${escapeHtml(description)}">
  <meta property="twitter:image" content="${ogImage}">
  
  <!-- Redirect to actual page for any JS-enabled browser -->
  <script>window.location.href = "${propertyUrl}";</script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${propertyUrl}">
  </noscript>
</head>
<body>
  <p>Redirecting to <a href="${propertyUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;
}

// Escape HTML special characters
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Main handler
export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent');
  
  // Only intercept /property/:id paths
  const propertyId = extractPropertyId(url.pathname);
  if (!propertyId) {
    return context.next();
  }

  // Only handle bot requests
  if (!isBot(userAgent)) {
    return context.next();
  }

  console.log(`[OG] Bot detected: ${userAgent?.substring(0, 50)}`);
  console.log(`[OG] Property ID: ${propertyId}`);

  // Get Supabase credentials from environment
  const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    console.error('[OG] Missing Supabase environment variables');
    return context.next();
  }

  // Fetch property data
  const property = await fetchProperty(propertyId, supabaseUrl, supabaseKey);
  
  if (!property) {
    console.log(`[OG] Property not found: ${propertyId}`);
    return context.next();
  }

  // Determine site URL
  const siteUrl = url.origin;

  // Generate and return OG HTML
  const html = generateOGHtml(property, siteUrl);
  
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  });
}

// Configure which paths this function handles
export const config = {
  path: "/property/*",
};
