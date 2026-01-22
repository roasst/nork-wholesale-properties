/**
 * Collage Generator - Creates image collages for 2-4 properties
 * Uses native Canvas API for client-side generation
 */

import { Property } from '../../types';

const COLLAGE_WIDTH = 1200;
const COLLAGE_HEIGHT = 630;
const BRAND_GREEN = '#7CB342';
const DARK_BG = '#1a1a1a';

interface CollageOptions {
  showPrices?: boolean;
  showAddress?: boolean;
  quality?: number;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
}

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
): void {
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#666';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('No Image', x + w/2, y + h/2);
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  prop: Property,
  x: number, y: number, w: number, h: number,
  opts: CollageOptions
): void {
  const overlayH = 55;
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(x, y + h - overlayH, w, overlayH);
  
  if (opts.showPrices !== false) {
    const price = '$' + prop.asking_price.toLocaleString();
    ctx.fillStyle = BRAND_GREEN;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(price, x + 8, y + h - overlayH + 22);
  }
  
  if (opts.showAddress !== false) {
    const addr = `${prop.street_address}, ${prop.city}`;
    const short = addr.length > 28 ? addr.slice(0, 26) + '...' : addr;
    ctx.fillStyle = '#fff';
    ctx.font = '13px Arial';
    ctx.fillText(short, x + 8, y + h - overlayH + 42);
  }
}

async function drawImage(
  ctx: CanvasRenderingContext2D,
  prop: Property | undefined,
  x: number, y: number, w: number, h: number,
  opts: CollageOptions
): Promise<void> {
  if (prop?.image_url) {
    try {
      const img = await loadImage(prop.image_url);
      const scale = Math.max(w / img.width, h / img.height);
      const sw = w / scale, sh = h / scale;
      ctx.drawImage(img, (img.width-sw)/2, (img.height-sh)/2, sw, sh, x, y, w, h);
    } catch {
      drawPlaceholder(ctx, x, y, w, h);
    }
  } else {
    drawPlaceholder(ctx, x, y, w, h);
  }
  if (prop) drawOverlay(ctx, prop, x, y, w, h, opts);
}

export async function generateCollage(
  properties: Property[],
  options: CollageOptions = {}
): Promise<string> {
  if (properties.length < 2 || properties.length > 4) {
    throw new Error('Collage requires 2-4 properties');
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = COLLAGE_WIDTH;
  canvas.height = COLLAGE_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, COLLAGE_WIDTH, COLLAGE_HEIGHT);
  
  const gap = 4;
  
  if (properties.length === 2) {
    const w = (COLLAGE_WIDTH - gap) / 2;
    await drawImage(ctx, properties[0], 0, 0, w, COLLAGE_HEIGHT, options);
    await drawImage(ctx, properties[1], w + gap, 0, w, COLLAGE_HEIGHT, options);
  } else if (properties.length === 3) {
    const leftW = COLLAGE_WIDTH * 0.55;
    const rightW = COLLAGE_WIDTH - leftW - gap;
    const rightH = (COLLAGE_HEIGHT - gap) / 2;
    await drawImage(ctx, properties[0], 0, 0, leftW, COLLAGE_HEIGHT, options);
    await drawImage(ctx, properties[1], leftW + gap, 0, rightW, rightH, options);
    await drawImage(ctx, properties[2], leftW + gap, rightH + gap, rightW, rightH, options);
  } else {
    const w = (COLLAGE_WIDTH - gap) / 2;
    const h = (COLLAGE_HEIGHT - gap) / 2;
    await drawImage(ctx, properties[0], 0, 0, w, h, options);
    await drawImage(ctx, properties[1], w + gap, 0, w, h, options);
    await drawImage(ctx, properties[2], 0, h + gap, w, h, options);
    await drawImage(ctx, properties[3], w + gap, h + gap, w, h, options);
  }
  
  // Add branding footer
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, COLLAGE_HEIGHT - 28, COLLAGE_WIDTH, 28);
  ctx.fillStyle = BRAND_GREEN;
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Nork Group  •  786-369-6335  •  NorkGroupLLC.com', COLLAGE_WIDTH / 2, COLLAGE_HEIGHT - 9);
  
  return canvas.toDataURL('image/jpeg', options.quality ?? 0.9);
}

export function downloadCollage(dataUrl: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename || `nork-deals-${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
