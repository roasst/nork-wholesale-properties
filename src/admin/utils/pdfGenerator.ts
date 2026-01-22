/**
 * PDF Generator - Creates branded PDF flyers for 5+ properties
 * Uses jsPDF for client-side generation
 */

import { Property } from '../../types';

const BRAND_GREEN = '#7CB342';
const DARK_TEXT = '#1a1a1a';
const LIGHT_TEXT = '#666666';

// Logo as base64 (will be loaded dynamically)
let logoDataUrl: string | null = null;

async function loadLogo(): Promise<string> {
  if (logoDataUrl) return logoDataUrl;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      logoDataUrl = canvas.toDataURL('image/png');
      resolve(logoDataUrl);
    };
    img.onerror = () => resolve('');
    img.src = '/nork-logo.png';
  });
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 200, maxH = 150;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

interface PDFOptions {
  title?: string;
  includeImages?: boolean;
}

export async function generatePDF(
  properties: Property[],
  options: PDFOptions = {}
): Promise<void> {
  // Dynamically import jsPDF
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });
  
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  
  // Load logo
  const logo = await loadLogo();
  
  // === HEADER ===
  const drawHeader = () => {
    // Logo (if available)
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', margin, 8, 35, 20);
      } catch { /* skip if logo fails */ }
    }
    
    // Company name
    doc.setFontSize(20);
    doc.setTextColor(BRAND_GREEN);
    doc.setFont('helvetica', 'bold');
    doc.text('Nork Group', pageW - margin, 18, { align: 'right' });
    
    // Contact info
    doc.setFontSize(10);
    doc.setTextColor(LIGHT_TEXT);
    doc.setFont('helvetica', 'normal');
    doc.text('786-369-6335  •  NorkGroupLLC.com', pageW - margin, 25, { align: 'right' });
    
    // Green line
    doc.setDrawColor(BRAND_GREEN);
    doc.setLineWidth(0.8);
    doc.line(margin, 32, pageW - margin, 32);
    
    return 38; // Return Y position after header
  };
  
  // === FOOTER ===
  const drawFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageH - 12;
    doc.setFontSize(8);
    doc.setTextColor(LIGHT_TEXT);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageW / 2, footerY, { align: 'center' });
    doc.text('Investment opportunities - prices subject to change', pageW / 2, footerY + 4, { align: 'center' });
  };
  
  // === TITLE ===
  let startY = drawHeader();
  const title = options.title || `${properties.length} Investment Opportunities`;
  doc.setFontSize(16);
  doc.setTextColor(DARK_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, startY);
  startY += 8;
  
  // Date
  doc.setFontSize(9);
  doc.setTextColor(LIGHT_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, startY);
  startY += 10;
  
  // === PROPERTIES ===
  const rowH = options.includeImages !== false ? 45 : 28;
  let y = startY;
  let pageNum = 1;
  const propsPerPage = Math.floor((pageH - startY - 20) / rowH);
  const totalPages = Math.ceil(properties.length / propsPerPage);
  
  // Preload images if needed
  const images: (string | null)[] = [];
  if (options.includeImages !== false) {
    for (const prop of properties) {
      if (prop.image_url) {
        images.push(await loadImageAsBase64(prop.image_url));
      } else {
        images.push(null);
      }
    }
  }
  
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    
    // Check if need new page
    if (y + rowH > pageH - 20) {
      drawFooter(pageNum, totalPages);
      doc.addPage();
      pageNum++;
      y = drawHeader();
    }
    
    // Alternating row background
    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, y - 2, contentW, rowH - 2, 'F');
    }
    
    let xOffset = margin;
    
    // Image thumbnail
    if (options.includeImages !== false && images[i]) {
      try {
        doc.addImage(images[i]!, 'JPEG', xOffset, y, 35, 26);
      } catch { /* skip */ }
      xOffset += 40;
    } else if (options.includeImages !== false) {
      // Placeholder
      doc.setFillColor(230, 230, 230);
      doc.rect(xOffset, y, 35, 26, 'F');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('No Image', xOffset + 17.5, y + 14, { align: 'center' });
      xOffset += 40;
    }
    
    // Property details
    const detailX = xOffset;
    
    // Address (bold)
    doc.setFontSize(11);
    doc.setTextColor(DARK_TEXT);
    doc.setFont('helvetica', 'bold');
    const address = `${prop.street_address}, ${prop.city}, FL ${prop.zip_code}`;
    doc.text(address.length > 50 ? address.slice(0, 48) + '...' : address, detailX, y + 6);
    
    // Price & ARV
    doc.setFontSize(10);
    doc.setTextColor(BRAND_GREEN);
    const price = `$${prop.asking_price.toLocaleString()}`;
    doc.text(price, detailX, y + 13);
    
    if (prop.arv) {
      doc.setTextColor(LIGHT_TEXT);
      doc.setFont('helvetica', 'normal');
      doc.text(`ARV: $${prop.arv.toLocaleString()}`, detailX + 45, y + 13);
    }
    
    // Details row
    doc.setFontSize(9);
    doc.setTextColor(LIGHT_TEXT);
    doc.setFont('helvetica', 'normal');
    const details = [
      prop.property_type || 'SFR',
      prop.bedrooms ? `${prop.bedrooms} BD` : null,
      prop.bathrooms ? `${prop.bathrooms} BA` : null,
      prop.square_footage ? `${prop.square_footage.toLocaleString()} sqft` : null,
      prop.county ? `${prop.county} County` : null
    ].filter(Boolean).join('  •  ');
    doc.text(details, detailX, y + 20);
    
    // Status badge
    if (prop.status) {
      const statusX = pageW - margin - 20;
      const statusColor = prop.status === 'available' ? '#22c55e' : 
                         prop.status === 'pending' ? '#f59e0b' : '#ef4444';
      doc.setFillColor(statusColor);
      doc.roundedRect(statusX, y + 2, 18, 6, 1, 1, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(prop.status.toUpperCase(), statusX + 9, y + 6.5, { align: 'center' });
    }
    
    y += rowH;
  }
  
  // Final footer
  drawFooter(pageNum, totalPages);
  
  // === CTA PAGE ===
  doc.addPage();
  drawHeader();
  
  const ctaY = pageH / 2 - 30;
  doc.setFontSize(24);
  doc.setTextColor(DARK_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.text('Ready to Invest?', pageW / 2, ctaY, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(LIGHT_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.text('Contact us today for more details on these properties', pageW / 2, ctaY + 12, { align: 'center' });
  
  // CTA Box
  doc.setFillColor(BRAND_GREEN);
  doc.roundedRect(pageW / 2 - 50, ctaY + 25, 100, 35, 3, 3, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('786-369-6335', pageW / 2, ctaY + 40, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('NorkGroupLLC.com', pageW / 2, ctaY + 52, { align: 'center' });
  
  drawFooter(totalPages + 1, totalPages + 1);
  
  // Save
  const filename = `nork-deals-${properties.length}-properties-${Date.now()}.pdf`;
  doc.save(filename);
}
