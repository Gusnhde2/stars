'use client';

import { useEffect, useRef, useState } from 'react';
import type { StarMapGeometry } from '@/lib/geometry/types';
import type { PosterConfig } from '@/types/export';
import type { Theme } from '@/types/render';
import { generatePosterPreview } from '@/lib/export/poster-export';

interface PosterPreviewProps {
  geometry: StarMapGeometry;
  config: PosterConfig;
  theme: Theme;
  size?: number;
}

export function PosterPreview({ geometry, config, theme, size = 600 }: PosterPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      setIsLoading(true);
      try {
        const url = await generatePosterPreview(geometry, config, theme, size);
        if (!cancelled) {
          setPreviewUrl(url);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to generate poster preview:', error);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [geometry, config, theme, size]);

  if (isLoading || !previewUrl) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size * 1.4 }}>
        <div className="text-neutral-500 text-sm">Generating preview...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex items-center justify-center">
      <img
        src={previewUrl}
        alt="Poster preview"
        className="max-w-full max-h-full object-contain"
        style={{ maxWidth: size, maxHeight: size * 1.4 }}
      />
    </div>
  );
}

