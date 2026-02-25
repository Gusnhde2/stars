/**
 * Geometry builder - creates render-ready geometry from astronomical data
 */

import type { Observer } from '@/types/observer';
import type { CatalogStar, ProjectedStar } from '@/types/star';
import type { RenderOptions } from '@/types/render';
import type { StarMapGeometry, RenderLayer, LayerType, CirclePrimitive, LinePrimitive, TextPrimitive } from './types';
import type { Point2D } from '../projection/types';
import { raDecToAltAz } from '../astronomy/coordinates';
import { projectAzimuthalEquidistant, generateAltitudeCircle } from '../projection/azimuthal';
import { createCircle, createLine, createPath, createText, magnitudeToRadius } from './primitives';
import { formatLocation, formatDateTime } from '../astronomy/observer';
import { getPlanetPositions } from '../astronomy/planets';
import constellationData from '../../data/constellations.json';

/**
 * Bounding box for collision detection
 */
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Label collision detector to prevent overlapping text
 */
class LabelCollisionDetector {
  private placedLabels: BoundingBox[] = [];
  private padding: number;

  constructor(padding: number = 2) {
    this.padding = padding;
  }

  /**
   * Estimate bounding box for a text label
   */
  private estimateBoundingBox(
    x: number,
    y: number,
    text: string,
    anchor: 'start' | 'middle' | 'end',
    fontSize: number
  ): BoundingBox {
    // Estimate text width based on character count and font size
    const charWidth = fontSize * 0.6;
    const width = text.length * charWidth;
    const height = fontSize * 1.2;

    // Adjust x based on anchor
    let adjustedX = x;
    if (anchor === 'middle') {
      adjustedX = x - width / 2;
    } else if (anchor === 'end') {
      adjustedX = x - width;
    }

    return {
      x: adjustedX - this.padding,
      y: y - height / 2 - this.padding,
      width: width + this.padding * 2,
      height: height + this.padding * 2,
    };
  }

  /**
   * Check if two bounding boxes intersect
   */
  private intersects(a: BoundingBox, b: BoundingBox): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  /**
   * Try to place a label, returns true if successful (no collision)
   */
  canPlace(
    x: number,
    y: number,
    text: string,
    anchor: 'start' | 'middle' | 'end' = 'middle',
    fontSize: number = 10
  ): boolean {
    const bbox = this.estimateBoundingBox(x, y, text, anchor, fontSize);

    for (const placed of this.placedLabels) {
      if (this.intersects(bbox, placed)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Place a label (mark its space as occupied)
   */
  place(
    x: number,
    y: number,
    text: string,
    anchor: 'start' | 'middle' | 'end' = 'middle',
    fontSize: number = 10
  ): void {
    const bbox = this.estimateBoundingBox(x, y, text, anchor, fontSize);
    this.placedLabels.push(bbox);
  }

  /**
   * Try to place a label, returns true and marks space if successful
   */
  tryPlace(
    x: number,
    y: number,
    text: string,
    anchor: 'start' | 'middle' | 'end' = 'middle',
    fontSize: number = 10
  ): boolean {
    if (this.canPlace(x, y, text, anchor, fontSize)) {
      this.place(x, y, text, anchor, fontSize);
      return true;
    }
    return false;
  }
}

/**
 * Build complete star map geometry from catalog and observer
 */
export function buildStarMapGeometry(
  stars: CatalogStar[],
  observer: Observer,
  options: RenderOptions,
  viewportSize: number = 1  // Normalized size
): StarMapGeometry {
  const layers = new Map<LayerType, RenderLayer>();
  const projectedStars: ProjectedStar[] = [];
  
  // Create collision detector for text labels (padding prevents labels from being too close)
  const labelCollision = new LabelCollisionDetector(8);
  
  // Calculate scale factor for the viewport
  const scale = viewportSize / 2 * 0.91; // Leave margin
  const center = viewportSize / 2;
  
  // Project all stars
  for (const star of stars) {
    if (star.mag > options.magnitudeLimit) continue;
    
    // Convert celestial to horizontal coordinates
    const { altitude, azimuth } = raDecToAltAz(star.ra, star.dec, observer);
    
    // Skip stars below horizon
    if (altitude <= 0) continue;
    
    // Project to 2D
    const projected = projectAzimuthalEquidistant(altitude, azimuth);
    
    // Calculate star radius based on magnitude
    const radius = magnitudeToRadius(
      star.mag,
      options.starSizeMin,
      options.starSizeMax,
      options.magnitudeLimit
    );
    
    projectedStars.push({
      hip: star.hip,
      x: center + projected.x * scale,
      y: center + projected.y * scale,
      altitude,
      azimuth,
      magnitude: star.mag,
      radius,
      name: star.name,
    });
  }
  
  // Create a map of HIP IDs to projected stars for constellation lookup
  const starMap = new Map<number, ProjectedStar>();
  for (const star of projectedStars) {
    starMap.set(star.hip, star);
  }
  
  // Define degree ring inner radius - stars beyond this should not be shown
  const degreeRingInnerRadius = scale * 0.96;
  
  // Build topographic contour lines (altitude bands)
  if (options.showTopoContours) {
    const topoPrimitives: CirclePrimitive[] = [];
    
    // Draw altitude contour lines every 15 degrees from horizon to zenith
    const altitudeSteps = [15, 30, 45, 60, 75];
    for (const alt of altitudeSteps) {
      const r = (90 - alt) / 90 * scale;
      // Create a circle at each altitude level
      topoPrimitives.push(createCircle(center, center, r, alt));
    }
    
    layers.set('topo-contours', {
      type: 'topo-contours',
      primitives: topoPrimitives,
      visible: true,
    });
  }
  
  // Build star layer - filter out stars that would appear in the degree ring area
  const filteredStars = projectedStars.filter(star => {
    const dx = star.x - center;
    const dy = star.y - center;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
    return distanceFromCenter < degreeRingInnerRadius;
  });
  
  const starPrimitives: CirclePrimitive[] = filteredStars
    .map(star => createCircle(star.x, star.y, star.radius, star.hip));
  
  layers.set('stars', {
    type: 'stars',
    primitives: starPrimitives,
    visible: true,
  });
  
  // Build star glow/spikes layer for bright stars
  if (options.starStyle === 'glow' || options.starStyle === 'spikes') {
    const effectPrimitives: (CirclePrimitive | LinePrimitive)[] = [];
    
    // Only add effects to stars brighter than magnitude 3.5
    const brightStarsForEffect = filteredStars.filter(s => s.magnitude < 3.5);
    
    for (const star of brightStarsForEffect) {
      // Brightness factor (brighter = bigger effect)
      const brightnessFactor = Math.max(0.5, (4 - star.magnitude) / 3);
      
      if (options.starStyle === 'glow') {
        // Glow: larger radius for halo effect (more subtle)
        const glowRadius = star.radius * (2 + brightnessFactor * 2.5); // Reduced from 3+4
        effectPrimitives.push(createCircle(star.x, star.y, glowRadius, star.hip));
      } else {
        // Spikes: draw 4 or 6 spike lines (more subtle)
        const spikeLength = star.radius * (2 + brightnessFactor * 2); // Reduced from 4+6
        const numSpikes = star.magnitude < 1.5 ? 6 : 4;
        
        for (let i = 0; i < numSpikes; i++) {
          const angle = (i * Math.PI * 2) / numSpikes + Math.PI / 4; // 45° offset
          effectPrimitives.push(createLine(
            star.x - Math.cos(angle) * spikeLength,
            star.y - Math.sin(angle) * spikeLength,
            star.x + Math.cos(angle) * spikeLength,
            star.y + Math.sin(angle) * spikeLength
          ));
        }
        // Also add a small glow for spikes (more subtle)
        const smallGlow = star.radius * 1.5; // Reduced from 2
        effectPrimitives.push(createCircle(star.x, star.y, smallGlow, star.hip));
      }
    }
    
    if (effectPrimitives.length > 0) {
      layers.set('star-glow', {
        type: 'star-glow',
        primitives: effectPrimitives,
        visible: true,
      });
    }
  }
  
  // Build constellation lines using RA/Dec coordinates from verified data
  if (options.showConstellations) {
    const constellationLines: LinePrimitive[] = [];
    
    for (const constellation of constellationData.constellations) {
      // Each constellation has multiple line strings (polylines)
      const lineStrings = constellation.lines as Array<Array<{ ra: number; dec: number }>>;
      
      if (lineStrings && lineStrings.length > 0) {
        for (const lineString of lineStrings) {
          // Draw connected line segments for this polyline
          for (let i = 0; i < lineString.length - 1; i++) {
            const point1 = lineString[i];
            const point2 = lineString[i + 1];
            
            // Convert RA/Dec to Alt/Az
            const coord1 = raDecToAltAz(point1.ra, point1.dec, observer);
            const coord2 = raDecToAltAz(point2.ra, point2.dec, observer);
            
            // Only draw if both points are above horizon
            if (coord1.altitude > 0 && coord2.altitude > 0) {
              // Project to 2D
              const proj1 = projectAzimuthalEquidistant(coord1.altitude, coord1.azimuth);
              const proj2 = projectAzimuthalEquidistant(coord2.altitude, coord2.azimuth);
              
              const x1 = center + proj1.x * scale;
              const y1 = center + proj1.y * scale;
              const x2 = center + proj2.x * scale;
              const y2 = center + proj2.y * scale;
              
              // Only draw if within the star display area (inside degree ring)
              const dist1 = Math.sqrt((x1 - center) ** 2 + (y1 - center) ** 2);
              const dist2 = Math.sqrt((x2 - center) ** 2 + (y2 - center) ** 2);
              
              if (dist1 < degreeRingInnerRadius && dist2 < degreeRingInnerRadius) {
                constellationLines.push(createLine(x1, y1, x2, y2));
              }
            }
          }
        }
      }
    }
    
    if (constellationLines.length > 0) {
      layers.set('constellations', {
        type: 'constellations',
        primitives: constellationLines,
        visible: true,
      });
    }
  }
  
  // Build constellation names (with collision detection)
  if (options.showConstellationNames) {
    const constellationNamePrimitives: TextPrimitive[] = [];
    
    // Collect constellation data with positions for sorting
    const constellationLabels: { name: string; x: number; y: number; pointCount: number }[] = [];
    
    for (const constellation of constellationData.constellations) {
      const lineStrings = constellation.lines as Array<Array<{ ra: number; dec: number }>>;
      
      if (lineStrings && lineStrings.length > 0) {
        // Calculate center of constellation from all line points
        const visiblePoints: { x: number; y: number }[] = [];
        
        for (const lineString of lineStrings) {
          for (const point of lineString) {
            const coord = raDecToAltAz(point.ra, point.dec, observer);
            if (coord.altitude > 0) {
              const proj = projectAzimuthalEquidistant(coord.altitude, coord.azimuth);
              visiblePoints.push({
                x: center + proj.x * scale,
                y: center + proj.y * scale,
              });
            }
          }
        }
        
        if (visiblePoints.length >= 2) {
          const avgX = visiblePoints.reduce((sum, p) => sum + p.x, 0) / visiblePoints.length;
          const avgY = visiblePoints.reduce((sum, p) => sum + p.y, 0) / visiblePoints.length;
          
          // Only consider if constellation center is reasonably visible
          const distFromCenter = Math.sqrt((avgX - center) ** 2 + (avgY - center) ** 2);
          if (distFromCenter < degreeRingInnerRadius * 0.85) {
            constellationLabels.push({
              name: constellation.name,
              x: avgX,
              y: avgY - 15, // Offset above center
              pointCount: visiblePoints.length,
            });
          }
        }
      }
    }
    
    // Sort by point count (more visible points = higher priority)
    constellationLabels.sort((a, b) => b.pointCount - a.pointCount);
    
    // Place labels with collision detection
    for (const label of constellationLabels) {
      if (labelCollision.tryPlace(label.x, label.y, label.name, 'middle', 11)) {
        constellationNamePrimitives.push(createText(label.x, label.y, label.name, 'middle', 'middle'));
      }
    }
    
    if (constellationNamePrimitives.length > 0) {
      layers.set('constellation-names', {
        type: 'constellation-names',
        primitives: constellationNamePrimitives,
        visible: true,
      });
    }
  }
  
  // Build star names (lowest priority - placed last with collision detection)
  if (options.showStarNames) {
    const starNamePrimitives: TextPrimitive[] = [];
    
    // Only label stars brighter than magnitude 2.5 and inside the degree ring
    const brightStars = projectedStars
      .filter(s => {
        if (s.magnitude > 2.5 || !s.name) return false;
        // Exclude stars in the degree ring area
        const dx = s.x - center;
        const dy = s.y - center;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        return distanceFromCenter < degreeRingInnerRadius;
      })
      .sort((a, b) => a.magnitude - b.magnitude); // Brightest first
    
    for (const star of brightStars) {
      // Offset label to the right and slightly above the star
      const labelX = star.x + star.radius + 8;
      const labelY = star.y - star.radius - 2;
      const labelText = star.name || '';
      
      // Try to place, skip if collision
      if (labelCollision.tryPlace(labelX, labelY, labelText, 'start', 9)) {
        starNamePrimitives.push(createText(labelX, labelY, labelText, 'start', 'middle'));
      }
    }
    
    if (starNamePrimitives.length > 0) {
      layers.set('star-names', {
        type: 'star-names',
        primitives: starNamePrimitives,
        visible: true,
      });
    }
  }
  
  // Build planets layer (with collision detection for labels)
  if (options.showPlanets) {
    const planetPositions = getPlanetPositions(observer);
    const planetPrimitives: (CirclePrimitive | TextPrimitive)[] = [];
    
    for (const planet of planetPositions) {
      const projected = projectAzimuthalEquidistant(planet.altitude, planet.azimuth);
      const planetX = center + projected.x * scale;
      const planetY = center + projected.y * scale;
      
      // Skip planets in the degree ring area
      const dx = planetX - center;
      const dy = planetY - center;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      if (distanceFromCenter >= degreeRingInnerRadius) continue;
      
      // Draw planet as a slightly larger circle
      planetPrimitives.push(createCircle(planetX, planetY, 3, 0));
      
      // Add planet name label with collision detection
      const labelX = planetX + 5;
      const labelY = planetY - 5;
      if (labelCollision.tryPlace(labelX, labelY, planet.name, 'start', 9)) {
        planetPrimitives.push(createText(labelX, labelY, planet.name, 'start', 'middle'));
      }
    }
    
    if (planetPrimitives.length > 0) {
      layers.set('planets', {
        type: 'planets',
        primitives: planetPrimitives,
        visible: true,
      });
    }
  }
  
  // Build horizon layer
  if (options.showHorizon) {
    const horizonCircle = generateAltitudeCircle(0, 72);
    const scaledHorizon: Point2D[] = horizonCircle.map(p => ({
      x: center + p.x * scale,
      y: center + p.y * scale,
    }));
    
    layers.set('horizon', {
      type: 'horizon',
      primitives: [createPath(scaledHorizon, true)],
      visible: true,
    });
  }
  
  // Build grid layer - equatorial grid centered on celestial pole
  if (options.showGrid) {
    const gridPrimitives: (LinePrimitive | CirclePrimitive)[] = [];
    
    // Find the North Celestial Pole position (RA=0, Dec=+90)
    const { altitude: poleAlt, azimuth: poleAz } = raDecToAltAz(0, 90, observer);
    
    // Only show equatorial grid if pole is visible (above horizon)
    if (poleAlt > 0) {
      const poleProjected = projectAzimuthalEquidistant(poleAlt, poleAz);
      const poleX = center + poleProjected.x * scale;
      const poleY = center + poleProjected.y * scale;
      
      // Draw declination circles centered on the celestial pole
      // Extend below celestial equator to reach the horizon
      const declinationSteps = [75, 60, 45, 30, 15, 0, -15, -30, -45, -60]; // Declination values
      
      for (const dec of declinationSteps) {
        // For each declination, draw points around the circle and connect them
        const points: Point2D[] = [];
        const numPoints = 72; // Smooth circle
        
        for (let i = 0; i <= numPoints; i++) {
          const ra = (i / numPoints) * 360;
          const { altitude, azimuth } = raDecToAltAz(ra, dec, observer);
          
          // Include points slightly below horizon to reach edge
          if (altitude > -5) {
            const projected = projectAzimuthalEquidistant(Math.max(altitude, 0.5), azimuth);
            points.push({
              x: center + projected.x * scale,
              y: center + projected.y * scale
            });
          }
        }
        
        // Draw line segments between consecutive points
        for (let i = 0; i < points.length - 1; i++) {
          const dx = points[i + 1].x - points[i].x;
          const dy = points[i + 1].y - points[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Only draw if points are close (avoid lines across the map)
          if (dist < scale * 0.3) {
            gridPrimitives.push(createLine(
              points[i].x, points[i].y,
              points[i + 1].x, points[i + 1].y
            ));
          }
        }
      }
      
      // Draw right ascension lines radiating from the celestial pole
      // Every 2 hours (30°)
      for (let ra = 0; ra < 360; ra += 30) {
        const raPoints: Point2D[] = [];
        
        // Draw from pole (dec 90) down to well below celestial equator to reach horizon
        for (let dec = 89; dec >= -90; dec -= 3) {
          const { altitude, azimuth } = raDecToAltAz(ra, dec, observer);
          
          // Include points near horizon
          if (altitude > -5) {
            const projected = projectAzimuthalEquidistant(Math.max(altitude, 0.5), azimuth);
            raPoints.push({
              x: center + projected.x * scale,
              y: center + projected.y * scale
            });
          }
        }
        
        // Draw line segments
        for (let i = 0; i < raPoints.length - 1; i++) {
          const dx = raPoints[i + 1].x - raPoints[i].x;
          const dy = raPoints[i + 1].y - raPoints[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Only draw if points are reasonably close
          if (dist < scale * 0.2) {
            gridPrimitives.push(createLine(
              raPoints[i].x, raPoints[i].y,
              raPoints[i + 1].x, raPoints[i + 1].y
            ));
          }
        }
      }
      
      // Mark the celestial pole with a small cross
      const crossSize = scale * 0.02;
      gridPrimitives.push(createLine(poleX - crossSize, poleY, poleX + crossSize, poleY));
      gridPrimitives.push(createLine(poleX, poleY - crossSize, poleX, poleY + crossSize));
    } else {
      // Fallback: If pole not visible, draw simple alt-az grid
      // Altitude circles at 15° intervals (denser)
      for (const alt of [15, 30, 45, 60, 75]) {
        const r = (90 - alt) / 90 * scale;
        gridPrimitives.push(createCircle(center, center, r));
      }
      
      // Azimuth lines at 30° intervals (denser)
      for (let az = 0; az < 360; az += 30) {
        const projected = projectAzimuthalEquidistant(0, az);
        gridPrimitives.push(createLine(
          center, center,
          center + projected.x * scale,
          center + projected.y * scale
        ));
      }
    }
    
    layers.set('grid', {
      type: 'grid',
      primitives: gridPrimitives,
      visible: true,
    });
  }
  
  // Build cardinal markers (highest priority - always placed first)
  if (options.showCardinals) {
    const cardinalPrimitives: TextPrimitive[] = [];
    const cardinals = [
      { label: 'N', azimuth: 0 },
      { label: 'E', azimuth: 90 },
      { label: 'S', azimuth: 180 },
      { label: 'W', azimuth: 270 },
    ];
    
    for (const { label, azimuth } of cardinals) {
      const projected = projectAzimuthalEquidistant(-5, azimuth); // Just below horizon
      const x = center + projected.x * scale;
      const y = center + projected.y * scale;
      
      // Cardinals always get placed and reserve their space
      labelCollision.place(x, y, label, 'middle', 14);
      cardinalPrimitives.push(createText(x, y, label, 'middle', 'middle'));
    }
    
    layers.set('cardinals', {
      type: 'cardinals',
      primitives: cardinalPrimitives,
      visible: true,
    });
  }
  
  // Build elaborate degree ring on the outside (placed after cardinals)
  if (options.showDegreeRing) {
    const degreeRingPrimitives: (LinePrimitive | TextPrimitive | CirclePrimitive)[] = [];
    
    // Ring dimensions for a more elaborate bezel
    const outerBezelRadius = scale * 1.02;    // Outer decorative ring
    const ringOuterRadius = scale * 1.0;       // Main ring outer edge
    const ringInnerRadius = scale * 0.96;      // Main ring inner edge
    const innerBezelRadius = scale * 0.94;     // Inner decorative ring
    const textRadius = scale * 0.88;           // Text inside the ring
    
    // Cardinal positions (skip degree labels here to avoid overlap with N/E/S/W)
    const cardinalDegrees = [0, 90, 180, 270];
    
    // Draw fine tick marks every 2 degrees for elegant detail
    for (let deg = 0; deg < 360; deg += 2) {
      const angle = (deg - 90) * (Math.PI / 180);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // Determine tick type: major (30°), medium (10°), fine (2°)
      const isMajor = deg % 30 === 0;
      const isMedium = deg % 10 === 0;
      const isCardinal = cardinalDegrees.includes(deg);
      
      // Different tick lengths for visual hierarchy
      let tickInnerRadius: number;
      if (isMajor) {
        tickInnerRadius = innerBezelRadius;  // Longest ticks at 30° intervals
      } else if (isMedium) {
        tickInnerRadius = ringInnerRadius * 0.99;  // Medium ticks at 10° intervals
      } else {
        tickInnerRadius = ringInnerRadius;  // Fine ticks every 2°
      }
      
      // Create tick mark
      degreeRingPrimitives.push(createLine(
        center + cos * tickInnerRadius,
        center + sin * tickInnerRadius,
        center + cos * ringOuterRadius,
        center + sin * ringOuterRadius
      ));
      
      // Add degree labels at major ticks (every 30 degrees), skip cardinals
      if (isMajor && !isCardinal) {
        const labelX = center + cos * textRadius;
        const labelY = center + sin * textRadius;
        const labelText = `${deg}°`;
        
        if (labelCollision.tryPlace(labelX, labelY, labelText, 'middle', 8)) {
          degreeRingPrimitives.push(createText(labelX, labelY, labelText, 'middle', 'middle'));
        }
      }
    }
    
    // Draw multiple concentric circles for elaborate bezel effect
    degreeRingPrimitives.push(createCircle(center, center, outerBezelRadius));  // Outer decorative
    degreeRingPrimitives.push(createCircle(center, center, ringOuterRadius));    // Main outer
    degreeRingPrimitives.push(createCircle(center, center, ringInnerRadius));    // Main inner
    degreeRingPrimitives.push(createCircle(center, center, innerBezelRadius));   // Inner decorative
    
    layers.set('degree-ring', {
      type: 'degree-ring',
      primitives: degreeRingPrimitives,
      visible: true,
    });
  }
  
  // Build metadata layer (coordinates and date)
  const metadataPrimitives: TextPrimitive[] = [];
  
  if (options.showMapCoordinates) {
    metadataPrimitives.push(
      createText(center, viewportSize * 0.94, formatLocation(observer), 'middle', 'middle')
    );
  }
  
  if (options.showMapDate) {
    metadataPrimitives.push(
      createText(center, viewportSize * 0.97, formatDateTime(observer), 'middle', 'middle')
    );
  }
  
  if (metadataPrimitives.length > 0) {
    layers.set('metadata', {
      type: 'metadata',
      primitives: metadataPrimitives,
      visible: true,
    });
  }
  
  return {
    layers,
    bounds: {
      width: viewportSize,
      height: viewportSize,
      centerX: center,
      centerY: center,
      radius: scale,
    },
    metadata: {
      starCount: stars.length,
      visibleStarCount: projectedStars.length,
      timestamp: observer.date,
      location: formatLocation(observer),
    },
  };
}

/**
 * Get projected stars from geometry (for external use)
 */
export function getProjectedStars(
  stars: CatalogStar[],
  observer: Observer,
  options: RenderOptions
): ProjectedStar[] {
  const projectedStars: ProjectedStar[] = [];
  
  for (const star of stars) {
    if (star.mag > options.magnitudeLimit) continue;
    
    const { altitude, azimuth } = raDecToAltAz(star.ra, star.dec, observer);
    if (altitude <= 0) continue;
    
    const projected = projectAzimuthalEquidistant(altitude, azimuth);
    const radius = magnitudeToRadius(
      star.mag,
      options.starSizeMin,
      options.starSizeMax,
      options.magnitudeLimit
    );
    
    projectedStars.push({
      hip: star.hip,
      x: projected.x,
      y: projected.y,
      altitude,
      azimuth,
      magnitude: star.mag,
      radius,
      name: star.name,
    });
  }
  
  return projectedStars;
}

