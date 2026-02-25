/**
 * Geometry primitive types for rendering
 */

import type { Point2D } from '../projection/types';

// Basic circle primitive (for stars)
export interface CirclePrimitive {
  type: 'circle';
  center: Point2D;
  radius: number;
  id?: number;        // Optional identifier (e.g., HIP number)
  data?: unknown;     // Optional associated data
}

// Line primitive (for constellation lines, grid)
export interface LinePrimitive {
  type: 'line';
  start: Point2D;
  end: Point2D;
}

// Path primitive (for complex shapes)
export interface PathPrimitive {
  type: 'path';
  points: Point2D[];
  closed: boolean;
}

// Text primitive (for labels)
export interface TextPrimitive {
  type: 'text';
  position: Point2D;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  baseline?: 'top' | 'middle' | 'bottom';
}

// Union type for all primitives
export type RenderPrimitive = CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive;

// Layer types for organized rendering
export type LayerType = 
  | 'background'
  | 'topo-contours'
  | 'grid'
  | 'horizon'
  | 'constellations'
  | 'constellation-names'
  | 'stars'
  | 'star-glow'
  | 'star-names'
  | 'planets'
  | 'cardinals'
  | 'degree-ring'
  | 'metadata'
  | 'hour-indices';

// A layer contains primitives of the same category
export interface RenderLayer {
  type: LayerType;
  primitives: RenderPrimitive[];
  visible: boolean;
}

// Complete geometry model for a star map
export interface StarMapGeometry {
  layers: Map<LayerType, RenderLayer>;
  bounds: {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    radius: number;
  };
  metadata: {
    starCount: number;
    visibleStarCount: number;
    timestamp: Date;
    location: string;
  };
}

