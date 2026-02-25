/**
 * PNG export functionality
 */

import type { StarMapGeometry } from '../geometry/types';
import type { Theme } from '@/types/render';
import type { ExportConfig } from '@/types/export';
import { buildStarMapGeometry } from '../geometry/builder';
import { renderStarMapToCanvas } from '../render/canvas';
import { downloadBlob, mmToPixels, generateFilename } from './utils';
import type { CatalogStar } from '@/types/star';
import type { Observer } from '@/types/observer';
import type { RenderOptions } from '@/types/render';

/**
 * Export star map as PNG file at specified DPI
 */
export async function exportPNG(
  stars: CatalogStar[],
  observer: Observer,
  renderOptions: RenderOptions,
  exportConfig: ExportConfig
): Promise<void> {
  const { widthMm, heightMm, dpi } = exportConfig;
  
  // Calculate pixel dimensions
  const widthPx = mmToPixels(widthMm, dpi);
  const heightPx = mmToPixels(heightMm, dpi);
  
  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Build geometry at export resolution
  const geometry = buildStarMapGeometry(stars, observer, {
    ...renderOptions,
    starSizeMin: renderOptions.starSizeMin * (widthPx / 500), // Scale for resolution
    starSizeMax: renderOptions.starSizeMax * (widthPx / 500),
  }, widthPx);
  
  // Render to canvas
  renderStarMapToCanvas(ctx, geometry, renderOptions.theme);
  
  // Convert to blob and download
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        
        const filename = generateFilename(
          geometry.metadata.location,
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
 * Export to PNG from existing geometry (faster if geometry is already computed)
 */
export async function exportPNGFromGeometry(
  geometry: StarMapGeometry,
  exportConfig: ExportConfig,
  theme: Theme
): Promise<void> {
  const { widthMm, dpi } = exportConfig;
  
  // Calculate pixel dimensions
  const sizePx = mmToPixels(widthMm, dpi);
  
  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = sizePx;
  canvas.height = sizePx;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Scale the context to match export size vs original geometry size
  const scale = sizePx / geometry.bounds.width;
  ctx.scale(scale, scale);
  
  // Render to canvas
  renderStarMapToCanvas(ctx, geometry, theme);
  
  // Convert to blob and download
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        
        const filename = generateFilename(
          geometry.metadata.location,
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

