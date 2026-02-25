/**
 * Projection type definitions
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface ProjectionResult extends Point2D {
  visible: boolean;  // Whether point is within projection bounds
}

export interface ProjectionConfig {
  // Center of projection (typically zenith)
  centerAltitude: number;  // degrees, default 90 (zenith)
  
  // Radius scaling
  maxRadius: number;       // normalized radius at horizon (default 1)
  
  // Orientation
  northUp: boolean;        // North at top (default true)
  eastRight: boolean;      // East to the right (default true)
}

export const DEFAULT_PROJECTION_CONFIG: ProjectionConfig = {
  centerAltitude: 90,
  maxRadius: 1,
  northUp: true,
  eastRight: true,  // East on RIGHT (mirror view, like looking at a star globe)
};

