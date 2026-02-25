/**
 * Azimuthal Equidistant Projection
 * 
 * Projects celestial coordinates onto a 2D plane where:
 * - Zenith (altitude = 90°) is at the center
 * - Horizon (altitude = 0°) is at the outer edge
 * - Azimuth determines the angular direction
 * - Distances from center are proportional to angular distance from zenith
 */

import type { Point2D, ProjectionResult, ProjectionConfig } from './types';
import { DEFAULT_PROJECTION_CONFIG } from './types';

/**
 * Convert altitude and azimuth to 2D plane coordinates
 * 
 * @param altitude - Degrees above horizon (0-90, can be negative)
 * @param azimuth - Degrees from North, clockwise (0-360)
 * @param config - Projection configuration
 * @returns 2D point with coordinates normalized to [-1, 1]
 */
export function projectAzimuthalEquidistant(
  altitude: number,
  azimuth: number,
  config: ProjectionConfig = DEFAULT_PROJECTION_CONFIG
): ProjectionResult {
  // Calculate radial distance from center
  // r = 0 at zenith (alt=90), r = maxRadius at horizon (alt=0)
  const angularDistance = config.centerAltitude - altitude;
  const r = (angularDistance / 90) * config.maxRadius;
  
  // Convert azimuth to radians
  // Azimuth: 0° = North, 90° = East, 180° = South, 270° = West
  let azRad = (azimuth * Math.PI) / 180;
  
  // Adjust for orientation
  if (!config.eastRight) {
    azRad = -azRad;
  }
  
  // Calculate cartesian coordinates
  // For North at top: x = r * sin(az), y = -r * cos(az)
  // The negative y is because canvas y increases downward
  let x = r * Math.sin(azRad);
  let y: number;
  
  if (config.northUp) {
    y = -r * Math.cos(azRad);
  } else {
    y = r * Math.cos(azRad);
  }
  
  // Determine visibility (above horizon)
  const visible = altitude > 0;
  
  return { x, y, visible };
}

/**
 * Inverse projection: convert 2D coordinates back to altitude/azimuth
 * Useful for interaction (clicking on the map)
 * 
 * @param point - 2D point in normalized coordinates [-1, 1]
 * @param config - Projection configuration
 * @returns Object with altitude and azimuth
 */
export function inverseAzimuthalEquidistant(
  point: Point2D,
  config: ProjectionConfig = DEFAULT_PROJECTION_CONFIG
): { altitude: number; azimuth: number } {
  const { x, y } = point;
  
  // Calculate radius
  const r = Math.sqrt(x * x + y * y);
  
  // Calculate altitude
  const angularDistance = (r / config.maxRadius) * 90;
  const altitude = config.centerAltitude - angularDistance;
  
  // Calculate azimuth
  let azRad: number;
  if (config.northUp) {
    azRad = Math.atan2(x, -y);
  } else {
    azRad = Math.atan2(x, y);
  }
  
  if (!config.eastRight) {
    azRad = -azRad;
  }
  
  // Convert to degrees [0, 360)
  let azimuth = (azRad * 180) / Math.PI;
  if (azimuth < 0) {
    azimuth += 360;
  }
  
  return { altitude, azimuth };
}

/**
 * Project a point and scale to canvas/viewport size
 * 
 * @param altitude - Degrees above horizon
 * @param azimuth - Degrees from North
 * @param viewportSize - Size of the viewport in pixels
 * @param config - Projection configuration
 * @returns Pixel coordinates
 */
export function projectToViewport(
  altitude: number,
  azimuth: number,
  viewportSize: number,
  config: ProjectionConfig = DEFAULT_PROJECTION_CONFIG
): { x: number; y: number; visible: boolean } {
  const projected = projectAzimuthalEquidistant(altitude, azimuth, config);
  
  // Scale from [-1, 1] to viewport coordinates
  const center = viewportSize / 2;
  const scale = center * 0.95; // Leave a small margin
  
  return {
    x: center + projected.x * scale,
    y: center + projected.y * scale,
    visible: projected.visible,
  };
}

/**
 * Calculate the projection radius for a given altitude
 * Useful for drawing altitude circles
 */
export function altitudeToRadius(
  altitude: number,
  config: ProjectionConfig = DEFAULT_PROJECTION_CONFIG
): number {
  const angularDistance = config.centerAltitude - altitude;
  return (angularDistance / 90) * config.maxRadius;
}

/**
 * Generate points along an altitude circle
 */
export function generateAltitudeCircle(
  altitude: number,
  pointCount: number = 72,
  config: ProjectionConfig = DEFAULT_PROJECTION_CONFIG
): Point2D[] {
  const points: Point2D[] = [];
  const step = 360 / pointCount;
  
  for (let az = 0; az < 360; az += step) {
    const projected = projectAzimuthalEquidistant(altitude, az, config);
    points.push({ x: projected.x, y: projected.y });
  }
  
  return points;
}

/**
 * Generate points along an azimuth line (from zenith to horizon)
 */
export function generateAzimuthLine(
  azimuth: number,
  config: ProjectionConfig = DEFAULT_PROJECTION_CONFIG
): Point2D[] {
  const points: Point2D[] = [];
  
  // From zenith (alt=90) to horizon (alt=0)
  for (let alt = 90; alt >= 0; alt -= 5) {
    const projected = projectAzimuthalEquidistant(alt, azimuth, config);
    points.push({ x: projected.x, y: projected.y });
  }
  
  return points;
}

