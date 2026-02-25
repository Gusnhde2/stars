/**
 * SVG rendering functions
 */

import type { StarMapGeometry, CirclePrimitive, LinePrimitive, PathPrimitive, TextPrimitive, LayerType } from '../geometry/types';
import type { RenderStyles } from './styles';
import type { Theme } from '@/types/render';
import { getStylesForTheme } from './styles';

/**
 * Generate SVG string from star map geometry
 */
export function renderStarMapToSVG(
  geometry: StarMapGeometry,
  widthMm: number,
  heightMm: number,
  theme: Theme = 'dark',
  options: {
    strokeOnly?: boolean;
    separateLayers?: boolean;
    includeMetadata?: boolean;
  } = {}
): string {
  const { strokeOnly = false, separateLayers = true, includeMetadata = true } = options;
  const styles = getStylesForTheme(theme, strokeOnly);
  const { width, height, centerX, centerY, radius } = geometry.bounds;
  
  // Scale factor from normalized coordinates to mm
  const scaleMm = widthMm / width;
  const centerMm = widthMm / 2;
  const radiusMm = radius * scaleMm;
  
  // Build SVG content
  const layers: string[] = [];
  
  // Background layer
  layers.push(renderBackgroundLayer(centerMm, radiusMm, styles));
  
  // Topographic contour lines layer
  const topoLayer = geometry.layers.get('topo-contours');
  if (topoLayer?.visible) {
    layers.push(renderTopoContoursLayerSVG(topoLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Grid layer
  const gridLayer = geometry.layers.get('grid');
  if (gridLayer?.visible) {
    layers.push(renderGridLayerSVG(gridLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Horizon layer
  const horizonLayer = geometry.layers.get('horizon');
  if (horizonLayer?.visible) {
    layers.push(renderHorizonLayerSVG(horizonLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Constellation lines layer
  const constellationLayer = geometry.layers.get('constellations');
  if (constellationLayer?.visible) {
    layers.push(renderConstellationLayerSVG(constellationLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Star glow layer (before stars for proper layering)
  const starGlowLayer = geometry.layers.get('star-glow');
  if (starGlowLayer?.visible) {
    layers.push(renderStarGlowLayerSVG(starGlowLayer.primitives, scaleMm, styles, theme, separateLayers));
  }
  
  // Stars layer
  const starsLayer = geometry.layers.get('stars');
  if (starsLayer?.visible) {
    layers.push(renderStarsLayerSVG(starsLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Planets layer
  const planetsLayer = geometry.layers.get('planets');
  if (planetsLayer?.visible) {
    layers.push(renderPlanetsLayerSVG(planetsLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Star names layer
  const starNamesLayer = geometry.layers.get('star-names');
  if (starNamesLayer?.visible) {
    layers.push(renderStarNamesLayerSVG(starNamesLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Constellation names layer
  const constellationNamesLayer = geometry.layers.get('constellation-names');
  if (constellationNamesLayer?.visible) {
    layers.push(renderConstellationNamesLayerSVG(constellationNamesLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Cardinals layer
  const cardinalsLayer = geometry.layers.get('cardinals');
  if (cardinalsLayer?.visible) {
    layers.push(renderCardinalsLayerSVG(cardinalsLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Degree ring layer
  const degreeRingLayer = geometry.layers.get('degree-ring');
  if (degreeRingLayer?.visible) {
    layers.push(renderDegreeRingLayerSVG(degreeRingLayer.primitives, scaleMm, styles, separateLayers));
  }
  
  // Metadata layer
  if (includeMetadata) {
    const metadataLayer = geometry.layers.get('metadata');
    if (metadataLayer?.visible) {
      layers.push(renderMetadataLayerSVG(metadataLayer.primitives, scaleMm, styles, separateLayers));
    }
  }
  
  // Compose final SVG
  const viewBoxSize = widthMm;
  
  // Determine halo color based on theme
  const haloColor = theme === 'light' ? '#ffffff' : styles.colors.background;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${widthMm}mm" 
     height="${heightMm}mm" 
     viewBox="0 0 ${viewBoxSize} ${viewBoxSize}">
  <title>Star Map - ${geometry.metadata.location}</title>
  <desc>Generated star map showing ${geometry.metadata.visibleStarCount} stars</desc>
  
  <!-- Definitions -->
  <defs>
    <!-- Clip mask for circular boundary -->
    <clipPath id="horizon-clip">
      <circle cx="${centerMm}" cy="${centerMm}" r="${radiusMm}"/>
    </clipPath>
    
    <!-- Text halo filter for better readability -->
    <filter id="text-halo" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" result="dilated" operator="dilate" radius="${fmt(scaleMm * 0.015)}"/>
      <feFlood flood-color="${haloColor}" flood-opacity="0.85" result="halo-color"/>
      <feComposite in="halo-color" in2="dilated" operator="in" result="halo"/>
      <feMerge>
        <feMergeNode in="halo"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Subtle text shadow for labels -->
    <filter id="text-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="${fmt(scaleMm * 0.01)}" flood-color="${haloColor}" flood-opacity="0.9"/>
    </filter>
  </defs>
  
${layers.join('\n')}
</svg>`;
}

/**
 * Render background layer
 */
function renderBackgroundLayer(
  centerMm: number,
  radiusMm: number,
  styles: RenderStyles
): string {
  return `  <!-- Background -->
  <g id="layer-background">
    <circle cx="${centerMm}" cy="${centerMm}" r="${radiusMm}" fill="${styles.colors.background}"/>
  </g>`;
}

/**
 * Render grid layer to SVG
 */
function renderGridLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  
  for (const p of primitives) {
    if (p.type === 'circle') {
      elements.push(`    <circle cx="${fmt(p.center.x * scale)}" cy="${fmt(p.center.y * scale)}" r="${fmt(p.radius * scale)}"/>`);
    } else if (p.type === 'line') {
      elements.push(`    <line x1="${fmt(p.start.x * scale)}" y1="${fmt(p.start.y * scale)}" x2="${fmt(p.end.x * scale)}" y2="${fmt(p.end.y * scale)}"/>`);
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Grid -->
  <g id="layer-grid" stroke="${styles.colors.grid}" stroke-width="${fmt(styles.gridWidth * scale)}" fill="none" clip-path="url(#horizon-clip)">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Render horizon layer to SVG
 */
function renderHorizonLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  
  for (const p of primitives) {
    if (p.type === 'path') {
      const d = pathToSVGD(p, scale);
      elements.push(`    <path d="${d}"/>`);
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Horizon -->
  <g id="layer-horizon" stroke="${styles.colors.horizon}" stroke-width="${fmt(styles.horizonWidth * scale)}" fill="none">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Render stars layer to SVG
 */
function renderStarsLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  
  for (const p of primitives) {
    if (p.type === 'circle') {
      const cx = fmt(p.center.x * scale);
      const cy = fmt(p.center.y * scale);
      const r = fmt(p.radius * scale);
      elements.push(`    <circle cx="${cx}" cy="${cy}" r="${r}"/>`);
    }
  }
  
  const fillAttr = styles.starFill ? `fill="${styles.colors.stars}"` : 'fill="none"';
  const strokeAttr = styles.starStroke ? 
    `stroke="${styles.colors.stars}" stroke-width="${fmt(styles.starStrokeWidth * scale)}"` : 
    'stroke="none"';
  
  if (wrapInGroup) {
    return `  <!-- Stars (${elements.length} visible) -->
  <g id="layer-stars" ${fillAttr} ${strokeAttr} clip-path="url(#horizon-clip)">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Render cardinals layer to SVG with elegant styling and text halo
 */
function renderCardinalsLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  const fontSize = styles.cardinalFontSize * scale;
  
  for (const p of primitives) {
    if (p.type === 'text') {
      const x = fmt(p.position.x * scale);
      const y = fmt(p.position.y * scale);
      const isNorth = p.text === 'N';
      
      // Special styling for North indicator
      if (isNorth) {
        // North gets special treatment with a subtle glow/emphasis
        elements.push(`    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-weight="600" letter-spacing="1">${p.text}</text>`);
      } else {
        elements.push(`    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-weight="400" letter-spacing="0.5" opacity="0.85">${p.text}</text>`);
      }
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Cardinal Directions -->
  <g id="layer-cardinals" fill="${styles.colors.cardinals}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="${fmt(fontSize)}" filter="url(#text-halo)">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Render degree ring layer to SVG with elaborate styling
 */
function renderDegreeRingLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const strokeColor = styles.colors.degreeRing;
  const thinStroke = fmt(styles.gridWidth * 0.5 * scale);
  const mediumStroke = fmt(styles.gridWidth * 0.8 * scale);
  const thickStroke = fmt(styles.gridWidth * 1.2 * scale);
  const fontSize = fmt(styles.metadataFontSize * 0.75 * scale);
  
  // Separate elements by type for different styling
  const fineTickElements: string[] = [];
  const mediumTickElements: string[] = [];
  const majorTickElements: string[] = [];
  const circleElements: string[] = [];
  const textElements: string[] = [];
  
  // Track circle radii to identify outer/inner decorative vs main rings
  const circleRadii: number[] = [];
  
  for (const p of primitives) {
    if (p.type === 'line') {
      const x1 = p.start.x * scale;
      const y1 = p.start.y * scale;
      const x2 = p.end.x * scale;
      const y2 = p.end.y * scale;
      
      // Calculate tick length to determine type
      const tickLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const normalizedLength = tickLength / scale;
      
      if (normalizedLength > 0.05) {
        // Major tick (longest)
        majorTickElements.push(`    <line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}"/>`);
      } else if (normalizedLength > 0.03) {
        // Medium tick
        mediumTickElements.push(`    <line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}"/>`);
      } else {
        // Fine tick
        fineTickElements.push(`    <line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}"/>`);
      }
    } else if (p.type === 'circle') {
      circleRadii.push(p.radius);
      circleElements.push(`    <circle cx="${fmt(p.center.x * scale)}" cy="${fmt(p.center.y * scale)}" r="${fmt(p.radius * scale)}"/>`);
    } else if (p.type === 'text') {
      const x = fmt(p.position.x * scale);
      const y = fmt(p.position.y * scale);
      textElements.push(`    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-weight="500" letter-spacing="0.5">${escapeXml(p.text)}</text>`);
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Degree Ring - Elaborate Bezel -->
  <g id="layer-degree-ring">
    <!-- Fine tick marks (2° intervals) -->
    <g stroke="${strokeColor}" stroke-width="${thinStroke}" fill="none" opacity="0.6" stroke-linecap="round">
${fineTickElements.join('\n')}
    </g>
    <!-- Medium tick marks (10° intervals) -->
    <g stroke="${strokeColor}" stroke-width="${mediumStroke}" fill="none" opacity="0.8" stroke-linecap="round">
${mediumTickElements.join('\n')}
    </g>
    <!-- Major tick marks (30° intervals) -->
    <g stroke="${strokeColor}" stroke-width="${thickStroke}" fill="none" stroke-linecap="round">
${majorTickElements.join('\n')}
    </g>
    <!-- Concentric bezel rings -->
    <g stroke="${strokeColor}" stroke-width="${thinStroke}" fill="none">
${circleElements.join('\n')}
    </g>
    <!-- Degree labels -->
    <g fill="${strokeColor}" stroke="none" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="${fontSize}">
${textElements.join('\n')}
    </g>
  </g>`;
  }
  
  return [...fineTickElements, ...mediumTickElements, ...majorTickElements, ...circleElements, ...textElements].join('\n');
}

/**
 * Render metadata layer to SVG
 */
function renderMetadataLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  
  for (const p of primitives) {
    if (p.type === 'text') {
      const x = fmt(p.position.x * scale);
      const y = fmt(p.position.y * scale);
      elements.push(`    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${escapeXml(p.text)}</text>`);
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Metadata -->
  <g id="layer-metadata" fill="${styles.colors.text}" font-family="${styles.fontFamily}" font-size="${fmt(styles.metadataFontSize * scale)}" filter="url(#text-shadow)">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Render constellation lines layer to SVG
 */
function renderConstellationLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  
  for (const p of primitives) {
    if (p.type === 'line') {
      elements.push(`    <line x1="${fmt(p.start.x * scale)}" y1="${fmt(p.start.y * scale)}" x2="${fmt(p.end.x * scale)}" y2="${fmt(p.end.y * scale)}"/>`);
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Constellation Lines -->
  <g id="layer-constellations" stroke="${styles.colors.constellations}" stroke-width="${fmt(styles.constellationWidth * scale)}" fill="none" clip-path="url(#horizon-clip)">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Render planets layer to SVG with text halo for labels
 */
function renderPlanetsLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const circleElements: string[] = [];
  const textElements: string[] = [];
  
  for (const p of primitives) {
    if (p.type === 'circle') {
      const cx = fmt(p.center.x * scale);
      const cy = fmt(p.center.y * scale);
      const r = fmt(styles.planetSize * scale);
      circleElements.push(`    <circle cx="${cx}" cy="${cy}" r="${r}"/>`);
    } else if (p.type === 'text') {
      const x = fmt(p.position.x * scale);
      const y = fmt(p.position.y * scale);
      textElements.push(`    <text x="${x}" y="${y}" text-anchor="start" dominant-baseline="middle">${escapeXml(p.text)}</text>`);
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Planets -->
  <g id="layer-planets" clip-path="url(#horizon-clip)">
    <g fill="${styles.colors.planets}">
${circleElements.join('\n')}
    </g>
    <g fill="${styles.colors.planets}" font-family="${styles.fontFamily}" font-size="${fmt(styles.metadataFontSize * 0.9 * scale)}" filter="url(#text-halo)">
${textElements.join('\n')}
    </g>
  </g>`;
  }
  
  return [...circleElements, ...textElements].join('\n');
}

/**
 * Render star names layer to SVG with refined styling and text halo
 */
function renderStarNamesLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  const fontSize = styles.metadataFontSize * 0.8 * scale;
  
  for (const p of primitives) {
    if (p.type === 'text') {
      const x = fmt(p.position.x * scale);
      const y = fmt(p.position.y * scale);
      elements.push(`    <text x="${x}" y="${y}" text-anchor="start" dominant-baseline="middle" font-weight="400" letter-spacing="0.3">${escapeXml(p.text)}</text>`);
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Star Names -->
  <g id="layer-star-names" fill="${styles.colors.starNames}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="${fmt(fontSize)}" filter="url(#text-halo)">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Render constellation names layer to SVG with elegant italic styling and text halo
 */
function renderConstellationNamesLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  const fontSize = styles.metadataFontSize * 1.05 * scale;
  
  for (const p of primitives) {
    if (p.type === 'text') {
      const x = fmt(p.position.x * scale);
      const y = fmt(p.position.y * scale);
      // Constellation names in elegant italic
      elements.push(`    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-style="italic" font-weight="300" letter-spacing="0.8">${escapeXml(p.text)}</text>`);
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Constellation Names -->
  <g id="layer-constellation-names" fill="${styles.colors.constellationNames}" font-family="Georgia, 'Times New Roman', serif" font-size="${fmt(fontSize)}" filter="url(#text-halo)">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Render topographic contour lines to SVG
 */
function renderTopoContoursLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  const topoColors = styles.colors.topoContours;
  let colorIndex = 0;
  
  for (const p of primitives) {
    if (p.type === 'circle') {
      const color = topoColors[colorIndex % topoColors.length];
      elements.push(`    <circle cx="${fmt(p.center.x * scale)}" cy="${fmt(p.center.y * scale)}" r="${fmt(p.radius * scale)}" stroke="${color}" stroke-dasharray="2 2" fill="none"/>`);
      colorIndex++;
    }
  }
  
  if (wrapInGroup) {
    return `  <!-- Topographic Contour Lines -->
  <g id="layer-topo-contours" stroke-width="${fmt(0.5 * scale)}" fill="none" opacity="0.6">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Render star glow/spikes layer to SVG
 */
function renderStarGlowLayerSVG(
  primitives: Array<CirclePrimitive | LinePrimitive | PathPrimitive | TextPrimitive>,
  scale: number,
  styles: RenderStyles,
  theme: Theme,
  wrapInGroup: boolean
): string {
  const elements: string[] = [];
  const gradientDefs: string[] = [];
  
  let glowIndex = 0;
  let spikeIndex = 0;
  
  for (const p of primitives) {
    if (p.type === 'circle') {
      const gradientId = `star-glow-${glowIndex}`;
      const cx = fmt(p.center.x * scale);
      const cy = fmt(p.center.y * scale);
      const r = fmt(p.radius * scale);
      
      // Create radial gradient for glow effect (more subtle)
      gradientDefs.push(`      <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${styles.colors.starGlow}" stop-opacity="0.2"/>
        <stop offset="30%" stop-color="${styles.colors.starGlow}" stop-opacity="0.12"/>
        <stop offset="70%" stop-color="${styles.colors.starGlow}" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="${styles.colors.starGlow}" stop-opacity="0"/>
      </radialGradient>`);
      
      elements.push(`    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${gradientId})"/>`);
      glowIndex++;
    } else if (p.type === 'line') {
      // Spike line with gradient
      const spikeGradientId = `star-spike-${spikeIndex}`;
      const x1 = fmt(p.start.x * scale);
      const y1 = fmt(p.start.y * scale);
      const x2 = fmt(p.end.x * scale);
      const y2 = fmt(p.end.y * scale);
      
      // Linear gradient for spike fade-out at ends (color adapts to theme)
      const spikeColor = theme === 'light' ? '#000000' : '#ffffff';
      gradientDefs.push(`      <linearGradient id="${spikeGradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${spikeColor}" stop-opacity="0"/>
        <stop offset="40%" stop-color="${spikeColor}" stop-opacity="0.2"/>
        <stop offset="50%" stop-color="${spikeColor}" stop-opacity="0.4"/>
        <stop offset="60%" stop-color="${spikeColor}" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="${spikeColor}" stop-opacity="0"/>
      </linearGradient>`);
      
      elements.push(`    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#${spikeGradientId})" stroke-width="${fmt(0.6 * scale)}" stroke-linecap="round" opacity="0.3"/>`);
      spikeIndex++;
    }
  }
  
  if (wrapInGroup && elements.length > 0) {
    return `  <!-- Star Glow/Spike Effects -->
  <defs>
${gradientDefs.join('\n')}
  </defs>
  <g id="layer-star-glow">
${elements.join('\n')}
  </g>`;
  }
  
  return elements.join('\n');
}

/**
 * Convert path primitive to SVG path data
 */
function pathToSVGD(path: PathPrimitive, scale: number): string {
  if (path.points.length === 0) return '';
  
  const parts: string[] = [];
  parts.push(`M ${fmt(path.points[0].x * scale)} ${fmt(path.points[0].y * scale)}`);
  
  for (let i = 1; i < path.points.length; i++) {
    parts.push(`L ${fmt(path.points[i].x * scale)} ${fmt(path.points[i].y * scale)}`);
  }
  
  if (path.closed) {
    parts.push('Z');
  }
  
  return parts.join(' ');
}

/**
 * Format number with limited precision for SVG output
 */
function fmt(n: number): string {
  return n.toFixed(3);
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

