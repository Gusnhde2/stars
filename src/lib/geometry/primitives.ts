/**
 * Primitive creation helpers
 */

import type { Point2D } from '../projection/types';
import type { 
  CirclePrimitive, 
  LinePrimitive, 
  PathPrimitive, 
  TextPrimitive 
} from './types';

/**
 * Create a circle primitive
 */
export function createCircle(
  x: number,
  y: number,
  radius: number,
  id?: number
): CirclePrimitive {
  return {
    type: 'circle',
    center: { x, y },
    radius,
    id,
  };
}

/**
 * Create a line primitive
 */
export function createLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): LinePrimitive {
  return {
    type: 'line',
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
  };
}

/**
 * Create a path primitive
 */
export function createPath(
  points: Point2D[],
  closed: boolean = false
): PathPrimitive {
  return {
    type: 'path',
    points,
    closed,
  };
}

/**
 * Create a text primitive
 */
export function createText(
  x: number,
  y: number,
  text: string,
  anchor: 'start' | 'middle' | 'end' = 'middle',
  baseline: 'top' | 'middle' | 'bottom' = 'middle'
): TextPrimitive {
  return {
    type: 'text',
    position: { x, y },
    text,
    anchor,
    baseline,
  };
}

/**
 * Calculate star radius from magnitude
 * Brighter stars (lower magnitude) get larger radii
 */
export function magnitudeToRadius(
  magnitude: number,
  minRadius: number,
  maxRadius: number,
  magnitudeLimit: number = 6.0
): number {
  // Magnitude scale is logarithmic: each step = 2.512x brightness difference
  // We want: mag = -1.5 → maxRadius, mag = magLimit → minRadius
  const minMag = -1.5;  // Brightest visible stars (like Sirius)
  const magRange = magnitudeLimit - minMag;
  
  // Normalize to [0, 1] where 0 = brightest, 1 = faintest
  const normalized = (magnitude - minMag) / magRange;
  const clamped = Math.max(0, Math.min(1, normalized));
  
  // Invert and apply sqrt curve for natural appearance
  // sqrt makes bright stars more prominent relative to dim ones
  const sizeFactor = Math.sqrt(1 - clamped);
  
  return minRadius + sizeFactor * (maxRadius - minRadius);
}

/**
 * Calculate opacity from magnitude (optional dimming of faint stars)
 */
export function magnitudeToOpacity(
  magnitude: number,
  magnitudeLimit: number = 6.0
): number {
  const minMag = -1.5;
  const normalized = (magnitude - minMag) / (magnitudeLimit - minMag);
  const clamped = Math.max(0, Math.min(1, normalized));
  
  // Faint stars get slightly dimmer opacity
  return 1 - clamped * 0.3;
}

