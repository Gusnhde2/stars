'use client';

import { useRef, useEffect } from 'react';
import type { StarMapGeometry } from '@/lib/geometry/types';
import type { Theme } from '@/types/render';
import { renderStarMapToCanvas } from '@/lib/render/canvas';

interface StarMapCanvasProps {
  geometry: StarMapGeometry;
  theme: Theme;
  size?: number;
  className?: string;
}

export function StarMapCanvas({
  geometry,
  theme,
  size = 500,
  className = '',
}: StarMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    // Scale context for high DPI
    ctx.scale(dpr, dpr);
    
    // Scale geometry to canvas size
    const scale = size / geometry.bounds.width;
    ctx.scale(scale, scale);
    
    // Render
    renderStarMapToCanvas(ctx, geometry, theme);
    
    // Reset transform for next render
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [geometry, theme, size]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}

