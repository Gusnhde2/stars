'use client';

import { useRef, useEffect, useState } from 'react';
import type { StarMapGeometry } from '@/lib/geometry/types';
import type { FrameConfig, PosterConfig } from '@/types/export';
import type { Theme } from '@/types/render';
import { renderPosterToCanvas } from '@/lib/export/poster-export';

interface FramedPreviewProps {
  geometry: StarMapGeometry;
  frameConfig: FrameConfig;
  posterConfig: PosterConfig;
  theme: Theme;
  size?: number;
}

const FRAME_IMAGES: Record<FrameConfig['frameFinish'], string> = {
  wood: '/frames/frame-wood.svg',
  white: '/frames/frame-white.svg',
  black: '/frames/frame-black.svg',
};

// SVG frame dimensions (from the SVG viewBox and content rect)
// Frame SVG is 400x500 with content area at (30,30) size 340x440
const SVG_WIDTH = 400;
const SVG_HEIGHT = 500;
const SVG_BORDER = 30;
const SVG_CONTENT_WIDTH = 340;
const SVG_CONTENT_HEIGHT = 440;

export function FramedPreview({ geometry, frameConfig, posterConfig, theme, size = 500 }: FramedPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);

  // Calculate total dimensions based on layout
  // For portrait: use SVG's natural 4:5 aspect ratio
  // For square: force 1:1 but content is still rectangular
  const isSquare = frameConfig.layout === 'square';
  
  // Total frame dimensions
  const totalWidth = size;
  const totalHeight = isSquare ? size : Math.round(size * (SVG_HEIGHT / SVG_WIDTH));
  
  // Calculate content area position and size based on SVG proportions
  // The border takes the same pixel ratio as in the SVG
  const borderX = Math.round(totalWidth * (SVG_BORDER / SVG_WIDTH));
  const borderY = Math.round(totalHeight * (SVG_BORDER / SVG_HEIGHT));
  const contentWidth = totalWidth - borderX * 2;
  const contentHeight = totalHeight - borderY * 2;

  // Render poster directly to canvas with exact frame content dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to exact content dimensions
    canvas.width = contentWidth;
    canvas.height = contentHeight;

    // Render poster directly to fit the frame perfectly (compact mode for framed)
    renderPosterToCanvas(ctx, geometry, posterConfig, theme, contentWidth, contentHeight, true);
  }, [geometry, posterConfig, theme, contentWidth, contentHeight]);

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{
        width: totalWidth,
        height: totalHeight,
      }}
    >
      {/* Realistic shadow layers */}
      <div 
        className="absolute inset-0 rounded-sm"
        style={{
          boxShadow: `
            0 2px 4px rgba(0,0,0,0.08),
            0 4px 8px rgba(0,0,0,0.08),
            0 8px 16px rgba(0,0,0,0.1),
            0 16px 32px rgba(0,0,0,0.12),
            0 32px 48px rgba(0,0,0,0.08)
          `,
        }}
      />
      {/* Poster canvas - rendered directly to exact frame content dimensions */}
      <canvas
        ref={canvasRef}
        className="absolute"
        style={{
          left: borderX,
          top: borderY,
          width: contentWidth,
          height: contentHeight,
        }}
      />
      
      {/* Frame overlay */}
      <img
        src={FRAME_IMAGES[frameConfig.frameFinish]}
        alt={`${frameConfig.frameFinish} frame`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: frameLoaded ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
        onLoad={() => setFrameLoaded(true)}
      />
      
      {/* Loading placeholder frame border */}
      {!frameLoaded && (
        <div 
          className="absolute inset-0"
          style={{
            borderWidth: borderX,
            borderStyle: 'solid',
            borderColor: frameConfig.frameFinish === 'wood' ? '#8B6914' : 
                         frameConfig.frameFinish === 'white' ? '#E8E8E8' : '#1A1A1A',
          }}
        />
      )}
    </div>
  );
}
