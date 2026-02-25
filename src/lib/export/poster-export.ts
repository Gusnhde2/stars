/**
 * Poster/Gift Card export functionality
 * Creates beautiful printable posters with star maps
 */

import type { StarMapGeometry } from '../geometry/types';
import type { Theme } from '@/types/render';
import type { PosterConfig } from '@/types/export';
import { PAPER_SIZES } from '@/types/export';
import { downloadBlob, mmToPixels, generateFilename } from './utils';
import { renderStarMapToCanvas } from '../render/canvas';

interface PosterColors {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  mapBorder: string;
  mapGlow: string;
}

const POSTER_STYLES: Record<string, Record<Theme, PosterColors>> = {
  minimal: {
    dark: {
      background: '#0a0a0f',
      primary: '#ffffff',
      secondary: '#888888',
      accent: '#d4af37',
      text: '#ffffff',
      textMuted: '#666666',
      mapBorder: '#333333',
      mapGlow: 'rgba(255,255,255,0.05)',
    },
    light: {
      background: '#fefefe',
      primary: '#111111',
      secondary: '#666666',
      accent: '#8b6914',
      text: '#111111',
      textMuted: '#999999',
      mapBorder: '#e0e0e0',
      mapGlow: 'rgba(0,0,0,0.03)',
    },
    monochrome: {
      background: '#000000',
      primary: '#ffffff',
      secondary: '#999999',
      accent: '#cccccc',
      text: '#ffffff',
      textMuted: '#666666',
      mapBorder: '#444444',
      mapGlow: 'rgba(255,255,255,0.05)',
    },
    sepia: {
      background: '#f5f0e6',
      primary: '#2c2416',
      secondary: '#7a6f5d',
      accent: '#8b6914',
      text: '#2c2416',
      textMuted: '#a09585',
      mapBorder: '#d4c9b8',
      mapGlow: 'rgba(44,36,22,0.05)',
    },
  },
  elegant: {
    dark: {
      background: '#050508',
      primary: '#d4af37',
      secondary: '#a08830',
      accent: '#ffd700',
      text: '#e8e8e8',
      textMuted: '#6a6a6a',
      mapBorder: '#d4af37',
      mapGlow: 'rgba(212,175,55,0.15)',
    },
    light: {
      background: '#fffef8',
      primary: '#1a1a1a',
      secondary: '#8b6914',
      accent: '#d4af37',
      text: '#1a1a1a',
      textMuted: '#888888',
      mapBorder: '#d4af37',
      mapGlow: 'rgba(212,175,55,0.1)',
    },
    monochrome: {
      background: '#000000',
      primary: '#d4af37',
      secondary: '#a08830',
      accent: '#ffd700',
      text: '#e0e0e0',
      textMuted: '#777777',
      mapBorder: '#d4af37',
      mapGlow: 'rgba(212,175,55,0.12)',
    },
    sepia: {
      background: '#f8f4e8',
      primary: '#3d3324',
      secondary: '#8b6914',
      accent: '#d4af37',
      text: '#3d3324',
      textMuted: '#9a8d78',
      mapBorder: '#c9a227',
      mapGlow: 'rgba(201,162,39,0.12)',
    },
  },
  celestial: {
    dark: {
      background: '#020210',
      primary: '#8fa3bf',
      secondary: '#5a7294',
      accent: '#c4a7e7',
      text: '#d4d8e8',
      textMuted: '#4a5568',
      mapBorder: '#3d4a6b',
      mapGlow: 'rgba(143,163,191,0.2)',
    },
    light: {
      background: '#f0f4f8',
      primary: '#2d3748',
      secondary: '#4a5568',
      accent: '#6b46c1',
      text: '#1a202c',
      textMuted: '#718096',
      mapBorder: '#a0aec0',
      mapGlow: 'rgba(107,70,193,0.08)',
    },
    monochrome: {
      background: '#000000',
      primary: '#a0b4cc',
      secondary: '#6080a0',
      accent: '#b0a0d0',
      text: '#d0d4e0',
      textMuted: '#556070',
      mapBorder: '#405060',
      mapGlow: 'rgba(160,180,204,0.15)',
    },
    sepia: {
      background: '#f5f0e1',
      primary: '#4a4033',
      secondary: '#6b5d4d',
      accent: '#7c5a9e',
      text: '#3d3424',
      textMuted: '#8a7d6a',
      mapBorder: '#a09080',
      mapGlow: 'rgba(124,90,158,0.1)',
    },
  },
  modern: {
    dark: {
      background: '#0f0f0f',
      primary: '#ffffff',
      secondary: '#888888',
      accent: '#00d9ff',
      text: '#ffffff',
      textMuted: '#555555',
      mapBorder: '#333333',
      mapGlow: 'rgba(0,217,255,0.15)',
    },
    light: {
      background: '#ffffff',
      primary: '#000000',
      secondary: '#555555',
      accent: '#0066cc',
      text: '#000000',
      textMuted: '#888888',
      mapBorder: '#ddd',
      mapGlow: 'rgba(0,102,204,0.08)',
    },
    monochrome: {
      background: '#0a0a0a',
      primary: '#ffffff',
      secondary: '#888888',
      accent: '#00ccff',
      text: '#ffffff',
      textMuted: '#555555',
      mapBorder: '#444444',
      mapGlow: 'rgba(0,204,255,0.12)',
    },
    sepia: {
      background: '#f2ebe0',
      primary: '#2c2820',
      secondary: '#5a5348',
      accent: '#0077aa',
      text: '#2c2820',
      textMuted: '#8a8070',
      mapBorder: '#c0b8a8',
      mapGlow: 'rgba(0,119,170,0.1)',
    },
  },
};

const FONT_STACKS = {
  serif: '"Playfair Display", "Cormorant Garamond", Georgia, "Times New Roman", serif',
  sans: '"Montserrat", "Raleway", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", "Space Mono", "SF Mono", Consolas, monospace',
};

/**
 * Get poster dimensions based on config
 */
function getPosterDimensions(config: PosterConfig) {
  const paper = PAPER_SIZES[config.paperFormat];
  const isLandscape = config.orientation === 'landscape' && !paper.isSquare;

  return {
    widthMm: isLandscape ? paper.heightMm : paper.widthMm,
    heightMm: isLandscape ? paper.widthMm : paper.heightMm,
  };
}

/**
 * Format date for display
 */
function formatDate(date: Date, showTime: boolean): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  let formatted = date.toLocaleDateString('en-US', options);

  if (showTime) {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    formatted += ' • ' + date.toLocaleTimeString('en-US', timeOptions);
  }

  return formatted;
}

/**
 * Format coordinates for display
 */
function formatCoordinates(location: string): string {
  // Extract coordinates if present, otherwise return location
  const coordMatch = location.match(/([\d.]+)°?\s*([NS]),?\s*([\d.]+)°?\s*([EW])/i);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]).toFixed(4);
    const latDir = coordMatch[2].toUpperCase();
    const lng = parseFloat(coordMatch[3]).toFixed(4);
    const lngDir = coordMatch[4].toUpperCase();
    return `${lat}° ${latDir}  •  ${lng}° ${lngDir}`;
  }
  return location;
}

/**
 * Unified poster rendering function - used by both export and preview
 * Exported for use in framed preview
 * @param compact - if true, uses reduced margins (for framed preview)
 */
export function renderPosterToCanvas(
  ctx: CanvasRenderingContext2D,
  geometry: StarMapGeometry,
  config: PosterConfig,
  theme: Theme,
  widthPx: number,
  heightPx: number,
  compact: boolean = false
): void {
  // Get colors for style and theme
  const colors = POSTER_STYLES[config.style]?.[theme] ?? POSTER_STYLES.elegant.dark;
  const fontFamily = FONT_STACKS[config.fontStyle];

  // Calculate layout - use smaller margins for compact/framed mode
  const margin = widthPx * (compact ? 0.04 : 0.08);
  const contentWidth = widthPx - margin * 2;
  const contentHeight = heightPx - margin * 2;

  // Map size based on config
  const mapSizeRatios = { small: 0.45, medium: 0.55, large: 0.65 };
  const mapDiameter = Math.min(contentWidth, contentHeight * mapSizeRatios[config.mapSize]);

  // Draw background
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, widthPx, heightPx);

  // Add subtle texture/gradient
  const bgGradient = ctx.createRadialGradient(
    widthPx / 2, heightPx / 2, 0,
    widthPx / 2, heightPx / 2, Math.max(widthPx, heightPx)
  );
  bgGradient.addColorStop(0, colors.mapGlow);
  bgGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, widthPx, heightPx);

  // Calculate map position
  let mapCenterY: number;
  const mapCenterX = widthPx / 2;

  switch (config.mapPosition) {
    case 'top':
      mapCenterY = margin + mapDiameter / 2 + heightPx * 0.05;
      break;
    case 'bottom':
      mapCenterY = heightPx - margin - mapDiameter / 2 - heightPx * 0.1;
      break;
    default: // center
      mapCenterY = heightPx * 0.45;
  }

  // Draw decorative border around map
  ctx.save();
  ctx.strokeStyle = colors.mapBorder;
  ctx.lineWidth = widthPx * 0.003;

  // Outer ring
  ctx.beginPath();
  ctx.arc(mapCenterX, mapCenterY, mapDiameter / 2 + widthPx * 0.015, 0, Math.PI * 2);
  ctx.stroke();

  // Inner decorative ring
  ctx.lineWidth = widthPx * 0.001;
  ctx.setLineDash([widthPx * 0.01, widthPx * 0.005]);
  ctx.beginPath();
  ctx.arc(mapCenterX, mapCenterY, mapDiameter / 2 + widthPx * 0.025, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Create circular clip for star map
  ctx.save();
  ctx.beginPath();
  ctx.arc(mapCenterX, mapCenterY, mapDiameter / 2, 0, Math.PI * 2);
  ctx.clip();

  // Draw star map into the circular area
  const starMapCanvas = document.createElement('canvas');
  const starMapSize = Math.ceil(mapDiameter);
  starMapCanvas.width = starMapSize;
  starMapCanvas.height = starMapSize;

  const starMapCtx = starMapCanvas.getContext('2d');
  if (starMapCtx) {
    // Scale geometry to fit
    const scale = starMapSize / geometry.bounds.width;
    starMapCtx.scale(scale, scale);
    renderStarMapToCanvas(starMapCtx, geometry, theme);
  }

  // Draw star map onto poster
  ctx.drawImage(
    starMapCanvas,
    mapCenterX - mapDiameter / 2,
    mapCenterY - mapDiameter / 2,
    mapDiameter,
    mapDiameter
  );

  ctx.restore();

  // Typography scaling
  const baseFontSize = widthPx * 0.03;

  // Draw title
  if (config.title) {
    ctx.fillStyle = colors.text;
    ctx.font = `300 ${baseFontSize * 1.8}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Use smaller top offset in compact mode
    const titleOffset = compact ? baseFontSize * 1.2 : baseFontSize * 2;
    const titleY = config.mapPosition === 'top'
      ? mapCenterY + mapDiameter / 2 + heightPx * (compact ? 0.05 : 0.08)
      : margin + titleOffset;

    // Letter spacing effect for title
    ctx.fillText(config.title.toUpperCase(), widthPx / 2, titleY);

    // Decorative line under title
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = widthPx * 0.001;
    const lineWidth = ctx.measureText(config.title.toUpperCase()).width * 0.4;
    ctx.beginPath();
    ctx.moveTo(widthPx / 2 - lineWidth / 2, titleY + baseFontSize * 1.2);
    ctx.lineTo(widthPx / 2 + lineWidth / 2, titleY + baseFontSize * 1.2);
    ctx.stroke();
  }

  // Draw subtitle (only if explicitly set)
  if (config.subtitle) {
    ctx.fillStyle = colors.secondary;
    ctx.font = `400 ${baseFontSize * 0.8}px ${fontFamily}`;
    ctx.textAlign = 'center';

    const subtitleY = config.mapPosition === 'top'
      ? mapCenterY + mapDiameter / 2 + heightPx * 0.14
      : margin + baseFontSize * 4;

    ctx.fillText(config.subtitle, widthPx / 2, subtitleY);
  }

  // Draw date/time and coordinates (bottom section)
  // In compact mode, use smaller bottom offset
  const bottomOffset = compact ? baseFontSize * 0.5 : baseFontSize;
  const bottomInfoY = heightPx - margin - bottomOffset;
  let currentY = bottomInfoY;

  // Coordinates
  if (config.showCoordinates) {
    ctx.fillStyle = colors.textMuted;
    ctx.font = `400 ${baseFontSize * 0.6}px ${FONT_STACKS.mono}`;
    ctx.textAlign = 'center';
    const coords = formatCoordinates(geometry.metadata.location);
    ctx.fillText(coords, widthPx / 2, currentY);
    currentY -= baseFontSize * 1.2;
  }

  // Date and time
  if (config.showDate) {
    ctx.fillStyle = colors.secondary;
    ctx.font = `400 ${baseFontSize * 0.75}px ${fontFamily}`;
    ctx.textAlign = 'center';
    const dateStr = formatDate(geometry.metadata.timestamp, config.showTime);
    ctx.fillText(dateStr, widthPx / 2, currentY);
    currentY -= baseFontSize * 1.5;
  }

  // Personal note/dedication
  if (config.note) {
    ctx.fillStyle = colors.text;
    ctx.font = `italic 400 ${baseFontSize * 0.9}px ${fontFamily}`;
    ctx.textAlign = 'center';

    // Word wrap the note
    const maxWidth = contentWidth * 0.8;
    const words = config.note.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Position note between map and bottom info
    const noteStartY = config.mapPosition === 'bottom'
      ? mapCenterY - mapDiameter / 2 - baseFontSize * 3
      : mapCenterY + mapDiameter / 2 + heightPx * 0.18;

    lines.forEach((line, i) => {
      ctx.fillText(line, widthPx / 2, noteStartY + i * baseFontSize * 1.4);
    });

    // Decorative quotes
    ctx.fillStyle = colors.accent;
    ctx.font = `${baseFontSize * 2}px ${fontFamily}`;
    ctx.globalAlpha = 0.3;
    ctx.fillText('"', widthPx / 2 - maxWidth / 2 - baseFontSize, noteStartY - baseFontSize * 0.5);
    ctx.fillText('"', widthPx / 2 + maxWidth / 2 + baseFontSize * 0.5, noteStartY + (lines.length - 1) * baseFontSize * 1.4 + baseFontSize * 0.5);
    ctx.globalAlpha = 1;
  }

  // Add corner decorations for elegant style
  if (config.style === 'elegant' || config.style === 'celestial') {
    ctx.strokeStyle = colors.mapBorder;
    ctx.lineWidth = widthPx * 0.001;
    const cornerSize = widthPx * 0.05;
    const cornerOffset = margin * 0.3;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(cornerOffset, cornerOffset + cornerSize);
    ctx.lineTo(cornerOffset, cornerOffset);
    ctx.lineTo(cornerOffset + cornerSize, cornerOffset);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(widthPx - cornerOffset - cornerSize, cornerOffset);
    ctx.lineTo(widthPx - cornerOffset, cornerOffset);
    ctx.lineTo(widthPx - cornerOffset, cornerOffset + cornerSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(cornerOffset, heightPx - cornerOffset - cornerSize);
    ctx.lineTo(cornerOffset, heightPx - cornerOffset);
    ctx.lineTo(cornerOffset + cornerSize, heightPx - cornerOffset);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(widthPx - cornerOffset - cornerSize, heightPx - cornerOffset);
    ctx.lineTo(widthPx - cornerOffset, heightPx - cornerOffset);
    ctx.lineTo(widthPx - cornerOffset, heightPx - cornerOffset - cornerSize);
    ctx.stroke();
  }
}

/**
 * Export star map as a beautiful poster PNG
 */
export async function exportPoster(
  geometry: StarMapGeometry,
  config: PosterConfig,
  theme: Theme
): Promise<void> {
  const { widthMm, heightMm } = getPosterDimensions(config);
  const widthPx = mmToPixels(widthMm, config.dpi);
  const heightPx = mmToPixels(heightMm, config.dpi);

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Render poster using unified function
  renderPosterToCanvas(ctx, geometry, config, theme, widthPx, heightPx);

  // Convert to blob and download
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }

        const filename = generateFilename(
          geometry.metadata.location + '-poster',
          geometry.metadata.timestamp,
          'png'
        );

        downloadBlob(blob, filename);
        resolve();
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Generate poster preview as data URL - uses exact same rendering as export
 */
export async function generatePosterPreview(
  geometry: StarMapGeometry,
  config: PosterConfig,
  theme: Theme,
  previewWidth: number = 400
): Promise<string> {
  const { widthMm, heightMm } = getPosterDimensions(config);
  const aspectRatio = heightMm / widthMm;

  // Create canvas at preview size
  const canvas = document.createElement('canvas');
  canvas.width = previewWidth;
  canvas.height = Math.round(previewWidth * aspectRatio);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Render poster using exact same unified function as export
  renderPosterToCanvas(ctx, geometry, config, theme, canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
}
