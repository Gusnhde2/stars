/**
 * SVG export functionality
 */

import type { StarMapGeometry } from '../geometry/types';
import type { Theme } from '@/types/render';
import type { ExportConfig } from '@/types/export';
import { renderStarMapToSVG } from '../render/svg';
import { downloadString, generateFilename } from './utils';

/**
 * Export star map as SVG file
 */
export function exportSVG(
  geometry: StarMapGeometry,
  config: ExportConfig,
  theme: Theme
): void {
  const svgContent = renderStarMapToSVG(
    geometry,
    config.widthMm,
    config.heightMm,
    theme,
    {
      strokeOnly: config.strokeOnly,
      separateLayers: config.separateLayers,
      includeMetadata: true,
    }
  );
  
  const filename = generateFilename(
    geometry.metadata.location,
    geometry.metadata.timestamp,
    'svg'
  );
  
  downloadString(svgContent, filename, 'image/svg+xml');
}

/**
 * Get SVG string without downloading (for preview or further processing)
 */
export function getSVGString(
  geometry: StarMapGeometry,
  widthMm: number,
  heightMm: number,
  theme: Theme,
  options: {
    strokeOnly?: boolean;
    separateLayers?: boolean;
    includeMetadata?: boolean;
  } = {}
): string {
  return renderStarMapToSVG(geometry, widthMm, heightMm, theme, options);
}

