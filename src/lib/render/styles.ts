/**
 * Shared style definitions for rendering
 */

import type { Theme, ThemeColors } from '@/types/render';
import { THEME_COLORS } from '@/types/render';

export interface RenderStyles {
  colors: ThemeColors;
  
  // Star styling
  starFill: boolean;
  starStroke: boolean;
  starStrokeWidth: number;
  
  // Line styling
  horizonWidth: number;
  gridWidth: number;
  constellationWidth: number;
  planetSize: number;
  
  // Text styling
  cardinalFontSize: number;
  metadataFontSize: number;
  fontFamily: string;
}

/**
 * Get render styles for a theme
 */
export function getStylesForTheme(theme: Theme, strokeOnly: boolean = false): RenderStyles {
  const colors = THEME_COLORS[theme];
  
  return {
    colors,
    starFill: !strokeOnly,
    starStroke: strokeOnly,
    starStrokeWidth: 0.5,
    horizonWidth: 2,
    gridWidth: 0.5,
    constellationWidth: 0.9,
    planetSize: 3,
    cardinalFontSize: 14,
    metadataFontSize: 8,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };
}

/**
 * Scale styles for different output sizes
 */
export function scaleStyles(styles: RenderStyles, scaleFactor: number): RenderStyles {
  return {
    ...styles,
    starStrokeWidth: styles.starStrokeWidth * scaleFactor,
    horizonWidth: styles.horizonWidth * scaleFactor,
    gridWidth: styles.gridWidth * scaleFactor,
    constellationWidth: styles.constellationWidth * scaleFactor,
    cardinalFontSize: styles.cardinalFontSize * scaleFactor,
    metadataFontSize: styles.metadataFontSize * scaleFactor,
  };
}

