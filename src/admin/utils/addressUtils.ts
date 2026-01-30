/**
 * Address normalization utilities for duplicate detection
 * Matches the normalization logic used in n8n workflow
 */

export function normalizeStreetAddress(street: string): string {
  if (!street) return '';
  
  return street
    .toLowerCase()
    .trim()
    // Standardize common abbreviations
    .replace(/\bstreet\b/g, 'st')
    .replace(/\bavenue\b/g, 'ave')
    .replace(/\bdrive\b/g, 'dr')
    .replace(/\broad\b/g, 'rd')
    .replace(/\bboulevard\b/g, 'blvd')
    .replace(/\blane\b/g, 'ln')
    .replace(/\bcourt\b/g, 'ct')
    .replace(/\bcircle\b/g, 'cir')
    .replace(/\bplace\b/g, 'pl')
    .replace(/\bterrace\b/g, 'ter')
    .replace(/\btrail\b/g, 'trl')
    .replace(/\bparkway\b/g, 'pkwy')
    .replace(/\bhighway\b/g, 'hwy')
    .replace(/\bway\b/g, 'way')
    // Directional abbreviations
    .replace(/\bnorth\b/g, 'n')
    .replace(/\bsouth\b/g, 's')
    .replace(/\beast\b/g, 'e')
    .replace(/\bwest\b/g, 'w')
    .replace(/\bnortheast\b/g, 'ne')
    .replace(/\bnorthwest\b/g, 'nw')
    .replace(/\bsoutheast\b/g, 'se')
    .replace(/\bsouthwest\b/g, 'sw')
    // Remove punctuation and extra spaces
    .replace(/[.,#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeZipCode(zip: string): string {
  if (!zip) return '';
  // Take first 5 digits only
  return zip.trim().substring(0, 5);
}

/**
 * Check if two addresses match after normalization
 */
export function addressesMatch(
  street1: string,
  zip1: string,
  street2: string,
  zip2: string
): boolean {
  const normalizedStreet1 = normalizeStreetAddress(street1);
  const normalizedStreet2 = normalizeStreetAddress(street2);
  const normalizedZip1 = normalizeZipCode(zip1);
  const normalizedZip2 = normalizeZipCode(zip2);
  
  return normalizedStreet1 === normalizedStreet2 && normalizedZip1 === normalizedZip2;
}
