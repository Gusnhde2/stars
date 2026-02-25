'use client';

import { useMemo } from 'react';
import type { StarMapGeometry } from '@/lib/geometry/types';
import type { Theme } from '@/types/render';
import { getSVGString } from '@/lib/export/svg-export';

interface StarMapSVGProps {
  geometry: StarMapGeometry;
  theme: Theme;
  widthMm?: number;
  heightMm?: number;
  strokeOnly?: boolean;
  className?: string;
}

export function StarMapSVG({
  geometry,
  theme,
  widthMm = 200,
  heightMm = 200,
  strokeOnly = false,
  className = '',
}: StarMapSVGProps) {
  const svgString = useMemo(() => {
    return getSVGString(geometry, widthMm, heightMm, theme, {
      strokeOnly,
      separateLayers: true,
      includeMetadata: true,
    });
  }, [geometry, theme, widthMm, heightMm, strokeOnly]);
  
  // Convert SVG string to data URL for display
  const dataUrl = useMemo(() => {
    const encoded = encodeURIComponent(svgString);
    return `data:image/svg+xml,${encoded}`;
  }, [svgString]);
  
  return (
    <div className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={dataUrl} 
        alt="Star Map SVG Preview"
        className="w-full h-full"
      />
    </div>
  );
}

