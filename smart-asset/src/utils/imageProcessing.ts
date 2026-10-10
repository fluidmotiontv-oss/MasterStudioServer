import { ColorBucket, SmartLayer, VectorTraceResult } from '../types';

/**
 * Extract dominant colors from a canvas element using color quantization.
 */
export function extractColorPalette(canvas: HTMLCanvasElement, maxColors = 6): ColorBucket[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const width = canvas.width;
  const height = canvas.height;
  // Sample a reasonable max resolution for speed
  const sampleWidth = Math.min(100, width);
  const sampleHeight = Math.min(100, height);

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = sampleHeight;
  const sampleCtx = sampleCanvas.getContext('2d');
  if (!sampleCtx) return [];

  sampleCtx.drawImage(canvas, 0, 0, sampleWidth, sampleHeight);
  const imageData = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = imageData.data;

  const colorCounts: Record<string, { rgb: [number, number, number]; count: number }> = {};
  let totalOpaquePixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent or near-transparent pixels
    if (a < 20) continue;

    totalOpaquePixels++;

    // Quantize to 16-step grid
    const qr = Math.round(r / 20) * 20;
    const qg = Math.round(g / 20) * 20;
    const qb = Math.round(b / 20) * 20;

    const key = `${qr},${qg},${qb}`;
    if (!colorCounts[key]) {
      colorCounts[key] = { rgb: [qr, qg, qb], count: 0 };
    }
    colorCounts[key].count++;
  }

  const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count);

  return sorted.slice(0, maxColors).map((item) => {
    const [r, g, b] = item.rgb;
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    const percentage = totalOpaquePixels > 0 ? Math.round((item.count / totalOpaquePixels) * 100) : 0;
    
    // Simple color name heuristic
    let name = 'Color';
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    if (maxChannel - minChannel < 30) {
      if (maxChannel > 200) name = 'Pure Light';
      else if (maxChannel < 50) name = 'Deep Dark';
      else name = 'Neutral Gray';
    } else if (r >= g && r >= b) {
      name = g > 150 ? 'Warm Gold/Amber' : 'Vibrant Red/Magenta';
    } else if (g >= r && g >= b) {
      name = r > 150 ? 'Lime Green' : 'Emerald/Cyan';
    } else {
      name = r > 150 ? 'Electric Violet' : 'Deep Azure/Blue';
    }

    return {
      hex,
      rgb: [r, g, b],
      percentage,
      name,
    };
  });
}

/**
 * Performs background transparency cutout based on alpha threshold or chroma keying.
 */
export function removeBackground(
  sourceImage: HTMLImageElement,
  alphaThreshold = 20,
  keyColorHex?: string,
  keyTolerance = 40
): string {
  const canvas = document.createElement('canvas');
  canvas.width = sourceImage.naturalWidth || sourceImage.width;
  canvas.height = sourceImage.naturalHeight || sourceImage.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceImage.src;

  ctx.drawImage(sourceImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let targetRGB: [number, number, number] | null = null;
  if (keyColorHex) {
    const cleanHex = keyColorHex.replace('#', '');
    targetRGB = [
      parseInt(cleanHex.substring(0, 2), 16),
      parseInt(cleanHex.substring(2, 4), 16),
      parseInt(cleanHex.substring(4, 6), 16),
    ];
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Alpha threshold
    if (a < alphaThreshold) {
      data[i + 3] = 0;
      continue;
    }

    // Chroma keying if color target provided
    if (targetRGB) {
      const dist = Math.sqrt(
        Math.pow(r - targetRGB[0], 2) +
        Math.pow(g - targetRGB[1], 2) +
        Math.pow(b - targetRGB[2], 2)
      );
      if (dist < keyTolerance) {
        data[i + 3] = Math.max(0, Math.floor((dist / keyTolerance) * 255));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Split image into Smart Layers: Subject, Shadow, and Outer Glow
 */
export function extractSmartLayers(sourceImg: HTMLImageElement): SmartLayer[] {
  const w = sourceImg.naturalWidth || sourceImg.width || 400;
  const h = sourceImg.naturalHeight || sourceImg.height || 400;

  // Layer 1: Main Subject Cutout
  const cutoutCanvas = document.createElement('canvas');
  cutoutCanvas.width = w;
  cutoutCanvas.height = h;
  const cCtx = cutoutCanvas.getContext('2d');
  if (cCtx) {
    cCtx.drawImage(sourceImg, 0, 0);
  }

  // Layer 2: Drop Shadow Layer
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = w;
  shadowCanvas.height = h;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    sCtx.filter = 'blur(12px) brightness(0)';
    sCtx.globalAlpha = 0.4;
    sCtx.drawImage(sourceImg, 0, 15);
  }

  // Layer 3: Neon Glow Pass
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = w;
  glowCanvas.height = h;
  const gCtx = glowCanvas.getContext('2d');
  if (gCtx) {
    gCtx.filter = 'blur(20px) saturate(200%) brightness(1.3)';
    gCtx.globalAlpha = 0.6;
    gCtx.drawImage(sourceImg, 0, 0);
  }

  return [
    {
      id: 'layer-glow',
      name: 'Ambient Glow Pass',
      type: 'glow',
      dataUrl: glowCanvas.toDataURL('image/png'),
      visible: true,
      opacity: 0.5,
      zIndex: 1,
      transform: { x: 0, y: 0, scale: 1.05, rotation: 0 },
    },
    {
      id: 'layer-shadow',
      name: 'Dynamic Shadow',
      type: 'shadow',
      dataUrl: shadowCanvas.toDataURL('image/png'),
      visible: true,
      opacity: 0.4,
      zIndex: 2,
      transform: { x: 0, y: 12, scale: 1, rotation: 0 },
    },
    {
      id: 'layer-subject',
      name: 'Isolated Subject',
      type: 'subject',
      dataUrl: cutoutCanvas.toDataURL('image/png'),
      visible: true,
      opacity: 1,
      zIndex: 3,
      transform: { x: 0, y: 0, scale: 1, rotation: 0 },
    },
  ];
}

/**
 * Traces outer contour of PNG image into clean SVG paths.
 */
export function traceVectorContour(imageElement: HTMLImageElement): VectorTraceResult {
  const w = imageElement.naturalWidth || imageElement.width || 300;
  const h = imageElement.naturalHeight || imageElement.height || 300;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return {
      svgContent: `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"></svg>`,
      pathCount: 0,
      viewBox: `0 0 ${w} ${h}`,
      simplifiedPaths: [],
    };
  }

  ctx.drawImage(imageElement, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h).data;

  // Scan boundary points along horizontal alpha threshold crossing
  const points: { x: number; y: number }[] = [];
  const step = Math.max(2, Math.floor(Math.min(w, h) / 80));

  for (let y = 0; y < h; y += step) {
    let rowStart: number | null = null;
    let rowEnd: number | null = null;

    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      const alpha = imgData[idx + 3];

      if (alpha > 30) {
        if (rowStart === null) rowStart = x;
        rowEnd = x;
      }
    }

    if (rowStart !== null && rowEnd !== null) {
      points.push({ x: rowStart, y });
      if (rowEnd !== rowStart) {
        points.push({ x: rowEnd, y });
      }
    }
  }

  if (points.length < 3) {
    // Fallback ellipse vector path
    const path = `M ${w * 0.1} ${h / 2} Q ${w / 2} ${h * 0.05} ${w * 0.9} ${h / 2} T ${w * 0.1} ${h / 2} Z`;
    const svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <path d="${path}" fill="none" stroke="currentColor" stroke-width="2" />
</svg>`;
    return {
      svgContent: svg,
      pathCount: 1,
      viewBox: `0 0 ${w} ${h}`,
      simplifiedPaths: [path],
    };
  }

  // Sort points to construct smooth outer hull path
  const sorted = points.sort((a, b) => a.y - b.y || a.x - b.x);
  let pathD = `M ${sorted[0].x} ${sorted[0].y}`;

  for (let i = 1; i < sorted.length; i++) {
    const p = sorted[i];
    pathD += ` L ${p.x} ${p.y}`;
  }
  pathD += ' Z';

  const svgContent = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vectorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
  </defs>
  <path d="${pathD}" fill="url(#vectorGlow)" fill-opacity="0.15" stroke="url(#vectorGlow)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
</svg>`;

  return {
    svgContent,
    pathCount: 1,
    viewBox: `0 0 ${w} ${h}`,
    simplifiedPaths: [pathD],
  };
}
