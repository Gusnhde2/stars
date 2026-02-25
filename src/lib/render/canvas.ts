/**
 * Canvas rendering functions
 */

import type { StarMapGeometry, CirclePrimitive, LinePrimitive, PathPrimitive, TextPrimitive, RenderPrimitive } from '../geometry/types';
import type { RenderStyles } from './styles';
import type { Theme } from '@/types/render';
import { getStylesForTheme } from './styles';

/**
 * Render complete star map to canvas
 */
export function renderStarMapToCanvas(
  ctx: CanvasRenderingContext2D,
  geometry: StarMapGeometry,
  theme: Theme = 'dark'
): void {
  const styles = getStylesForTheme(theme);
  const { width, height, centerX, centerY, radius } = geometry.bounds;
  
  // Determine halo color based on theme
  const haloColor = theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(10,10,15,0.85)';
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw background
  ctx.fillStyle = styles.colors.background;
  ctx.fillRect(0, 0, width, height);
  
  // Draw circular clip mask
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.94, 0, Math.PI * 2);
  ctx.clip();
  
  // Draw topographic contour lines (altitude bands)
  const topoLayer = geometry.layers.get('topo-contours');
  if (topoLayer?.visible) {
    const topoColors = styles.colors.topoContours;
    let colorIndex = 0;
    for (const primitive of topoLayer.primitives) {
      if (primitive.type === 'circle') {
        ctx.strokeStyle = topoColors[colorIndex % topoColors.length];
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(primitive.center.x, primitive.center.y, primitive.radius, 0, Math.PI * 2);
        ctx.stroke();
        colorIndex++;
      }
    }
    ctx.setLineDash([]);
  }
  
  // Draw grid layer
  const gridLayer = geometry.layers.get('grid');
  if (gridLayer?.visible) {
    renderLayerToCanvas(ctx, gridLayer.primitives, styles.colors.grid, styles);
  }
  
  // Draw horizon layer
  const horizonLayer = geometry.layers.get('horizon');
  if (horizonLayer?.visible) {
    ctx.strokeStyle = styles.colors.horizon;
    ctx.lineWidth = styles.horizonWidth;
    for (const primitive of horizonLayer.primitives) {
      if (primitive.type === 'path') {
        renderPathToCanvas(ctx, primitive);
      }
    }
  }
  
  // Draw constellation lines (before stars for layering)
  const constellationLayer = geometry.layers.get('constellations');
  if (constellationLayer?.visible) {
    ctx.strokeStyle = styles.colors.constellations;
    ctx.lineWidth = styles.constellationWidth;
    for (const primitive of constellationLayer.primitives) {
      if (primitive.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(primitive.start.x, primitive.start.y);
        ctx.lineTo(primitive.end.x, primitive.end.y);
        ctx.stroke();
      }
    }
  }
  
  // Draw star glow/spikes layer (effects for bright stars)
  const starGlowLayer = geometry.layers.get('star-glow');
  if (starGlowLayer?.visible) {
    for (const primitive of starGlowLayer.primitives) {
      if (primitive.type === 'circle') {
        // Glow effect: radial gradient (more subtle)
        const gradient = ctx.createRadialGradient(
          primitive.center.x, primitive.center.y, 0,
          primitive.center.x, primitive.center.y, primitive.radius
        );
        gradient.addColorStop(0, styles.colors.starGlow + '30'); // Reduced from 80
        gradient.addColorStop(0.3, styles.colors.starGlow + '20'); // Reduced from 40
        gradient.addColorStop(0.7, styles.colors.starGlow + '08'); // Reduced from 15
        gradient.addColorStop(1, styles.colors.starGlow + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(primitive.center.x, primitive.center.y, primitive.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (primitive.type === 'line') {
        // Spike effect: draw diffraction spike lines (color adapts to theme)
        ctx.save();
        ctx.lineWidth = 0.8; // Slightly thinner
        ctx.globalAlpha = 0.3; // Reduced from 0.6
        
        // Use white for dark backgrounds, black for light backgrounds
        const spikeColor = theme === 'light' ? '#000000' : '#ffffff';
        
        // Create gradient along the spike
        const gradient = ctx.createLinearGradient(
          primitive.start.x, primitive.start.y,
          primitive.end.x, primitive.end.y
        );
        gradient.addColorStop(0, spikeColor + '00');
        gradient.addColorStop(0.1, spikeColor + '30'); // Reduced from 60
        gradient.addColorStop(0.2, spikeColor + '60'); // Reduced from cc
        gradient.addColorStop(0.3, spikeColor + '30'); // Reduced from 60
        gradient.addColorStop(1, spikeColor + '00');
        
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(primitive.start.x, primitive.start.y);
        ctx.lineTo(primitive.end.x, primitive.end.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
  
  // Draw stars layer
  const starsLayer = geometry.layers.get('stars');
  if (starsLayer?.visible) {
    ctx.fillStyle = styles.colors.stars;
    for (const primitive of starsLayer.primitives) {
      if (primitive.type === 'circle') {
        renderCircleToCanvas(ctx, primitive, styles);
      }
    }
  }
  
  // Draw planets layer with halo for text
  const planetsLayer = geometry.layers.get('planets');
  if (planetsLayer?.visible) {
    ctx.fillStyle = styles.colors.planets;
    ctx.font = `${styles.metadataFontSize * 0.85}px ${styles.fontFamily}`;
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    for (const primitive of planetsLayer.primitives) {
      if (primitive.type === 'circle') {
        renderCircleToCanvas(ctx, primitive, styles);
      } else if (primitive.type === 'text') {
        renderTextWithHaloToCanvas(ctx, primitive, haloColor, 2.5);
      }
    }
  }
  
  ctx.restore();
  
  // Draw star names (outside clip) with halo
  const starNamesLayer = geometry.layers.get('star-names');
  if (starNamesLayer?.visible) {
    ctx.fillStyle = styles.colors.starNames;
    ctx.font = `${styles.metadataFontSize * 0.85}px ${styles.fontFamily}`;
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    for (const primitive of starNamesLayer.primitives) {
      if (primitive.type === 'text') {
        renderTextWithHaloToCanvas(ctx, primitive, haloColor, 2.5);
      }
    }
  }
  
  // Draw constellation names (outside clip) with halo
  const constellationNamesLayer = geometry.layers.get('constellation-names');
  if (constellationNamesLayer?.visible) {
    ctx.fillStyle = styles.colors.constellationNames;
    ctx.font = `italic ${styles.metadataFontSize * 1.1}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const primitive of constellationNamesLayer.primitives) {
      if (primitive.type === 'text') {
        renderTextWithHaloToCanvas(ctx, primitive, haloColor, 3);
      }
    }
  }
  
  // Draw cardinals layer (outside clip) with halo
  const cardinalsLayer = geometry.layers.get('cardinals');
  if (cardinalsLayer?.visible) {
    ctx.fillStyle = styles.colors.cardinals;
    ctx.font = `bold ${styles.cardinalFontSize}px ${styles.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const primitive of cardinalsLayer.primitives) {
      if (primitive.type === 'text') {
        renderTextWithHaloToCanvas(ctx, primitive, haloColor, 3.5);
      }
    }
  }
  
  // Draw degree ring layer (outside clip) with halo for text
  const degreeRingLayer = geometry.layers.get('degree-ring');
  if (degreeRingLayer?.visible) {
    ctx.strokeStyle = styles.colors.degreeRing;
    ctx.fillStyle = styles.colors.degreeRing;
    ctx.lineWidth = styles.gridWidth;
    ctx.font = `500 ${styles.metadataFontSize * 0.75}px ${styles.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const primitive of degreeRingLayer.primitives) {
      if (primitive.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(primitive.start.x, primitive.start.y);
        ctx.lineTo(primitive.end.x, primitive.end.y);
        ctx.stroke();
      } else if (primitive.type === 'circle') {
        ctx.beginPath();
        ctx.arc(primitive.center.x, primitive.center.y, primitive.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (primitive.type === 'text') {
        renderTextWithHaloToCanvas(ctx, primitive, haloColor, 2);
      }
    }
  }
  
  // Draw metadata layer
  const metadataLayer = geometry.layers.get('metadata');
  if (metadataLayer?.visible) {
    ctx.fillStyle = styles.colors.text;
    ctx.font = `${styles.metadataFontSize}px ${styles.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const primitive of metadataLayer.primitives) {
      if (primitive.type === 'text') {
        renderTextToCanvas(ctx, primitive);
      }
    }
  }
}

/**
 * Render a layer of primitives
 */
function renderLayerToCanvas(
  ctx: CanvasRenderingContext2D,
  primitives: RenderPrimitive[],
  color: string,
  styles: RenderStyles
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = styles.gridWidth;
  
  for (const primitive of primitives) {
    switch (primitive.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(primitive.center.x, primitive.center.y, primitive.radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(primitive.start.x, primitive.start.y);
        ctx.lineTo(primitive.end.x, primitive.end.y);
        ctx.stroke();
        break;
      case 'path':
        renderPathToCanvas(ctx, primitive);
        break;
    }
  }
}

/**
 * Render a circle (star) to canvas
 */
function renderCircleToCanvas(
  ctx: CanvasRenderingContext2D,
  primitive: CirclePrimitive,
  styles: RenderStyles
): void {
  ctx.beginPath();
  ctx.arc(primitive.center.x, primitive.center.y, primitive.radius, 0, Math.PI * 2);
  
  if (styles.starFill) {
    ctx.fill();
  }
  if (styles.starStroke) {
    ctx.lineWidth = styles.starStrokeWidth;
    ctx.stroke();
  }
}

/**
 * Render a path to canvas
 */
function renderPathToCanvas(
  ctx: CanvasRenderingContext2D,
  primitive: PathPrimitive
): void {
  if (primitive.points.length < 2) return;
  
  ctx.beginPath();
  ctx.moveTo(primitive.points[0].x, primitive.points[0].y);
  
  for (let i = 1; i < primitive.points.length; i++) {
    ctx.lineTo(primitive.points[i].x, primitive.points[i].y);
  }
  
  if (primitive.closed) {
    ctx.closePath();
  }
  ctx.stroke();
}

/**
 * Render text to canvas
 */
function renderTextToCanvas(
  ctx: CanvasRenderingContext2D,
  primitive: TextPrimitive
): void {
  if (primitive.anchor) {
    ctx.textAlign = primitive.anchor === 'start' ? 'left' : 
                    primitive.anchor === 'end' ? 'right' : 'center';
  }
  if (primitive.baseline) {
    ctx.textBaseline = primitive.baseline;
  }
  ctx.fillText(primitive.text, primitive.position.x, primitive.position.y);
}

/**
 * Render text with halo/padding background to canvas
 */
function renderTextWithHaloToCanvas(
  ctx: CanvasRenderingContext2D,
  primitive: TextPrimitive,
  haloColor: string,
  haloWidth: number = 3
): void {
  if (primitive.anchor) {
    ctx.textAlign = primitive.anchor === 'start' ? 'left' : 
                    primitive.anchor === 'end' ? 'right' : 'center';
  }
  if (primitive.baseline) {
    ctx.textBaseline = primitive.baseline;
  }
  
  // Save current style
  const originalFillStyle = ctx.fillStyle;
  
  // Draw halo (stroke behind text)
  ctx.save();
  ctx.strokeStyle = haloColor;
  ctx.lineWidth = haloWidth;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(primitive.text, primitive.position.x, primitive.position.y);
  ctx.restore();
  
  // Draw text on top
  ctx.fillStyle = originalFillStyle;
  ctx.fillText(primitive.text, primitive.position.x, primitive.position.y);
}

/**
 * Simple canvas clear
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.clearRect(0, 0, width, height);
}

