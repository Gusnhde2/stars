'use client';

import { useCallback, useState } from 'react';
import type { StarMapGeometry } from '@/lib/geometry/types';
import type { ExportConfig, PosterConfig, FrameConfig } from '@/types/export';
import type { Theme } from '@/types/render';
import type { CatalogStar } from '@/types/star';
import type { Observer } from '@/types/observer';
import type { RenderOptions } from '@/types/render';
import { DEFAULT_EXPORT_CONFIG, DEFAULT_POSTER_CONFIG, DEFAULT_FRAME_CONFIG } from '@/types/export';
import { exportSVG, getSVGString } from '@/lib/export/svg-export';
import { exportPNG } from '@/lib/export/png-export';
import { exportPoster } from '@/lib/export/poster-export';

interface UseExportOptions {
  initialConfig?: Partial<ExportConfig>;
}

interface UseExportReturn {
  // State
  exportConfig: ExportConfig;
  posterConfig: PosterConfig;
  frameConfig: FrameConfig;
  isExporting: boolean;
  error: string | null;

  // Setters
  setExportConfig: (config: Partial<ExportConfig>) => void;
  setPosterConfig: (config: Partial<PosterConfig>) => void;
  setFrameConfig: (config: Partial<FrameConfig>) => void;

  // Actions
  exportAsSVG: (geometry: StarMapGeometry, theme: Theme) => void;
  exportAsPNG: (
    stars: CatalogStar[],
    observer: Observer,
    renderOptions: RenderOptions,
  ) => Promise<void>;
  exportAsPoster: (geometry: StarMapGeometry, theme: Theme) => Promise<void>;
  getSVGPreview: (geometry: StarMapGeometry, theme: Theme) => string;
}

export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const { initialConfig = {} } = options;

  const [exportConfig, setExportConfigState] = useState<ExportConfig>({
    ...DEFAULT_EXPORT_CONFIG,
    ...initialConfig,
  });



  const [posterConfig, setPosterConfigState] = useState<PosterConfig>({
    ...DEFAULT_POSTER_CONFIG,
  });

  const [frameConfig, setFrameConfigState] = useState<FrameConfig>({
    ...DEFAULT_FRAME_CONFIG,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setExportConfig = useCallback((config: Partial<ExportConfig>) => {
    setExportConfigState(prev => ({ ...prev, ...config }));
  }, []);



  const setPosterConfig = useCallback((config: Partial<PosterConfig>) => {
    setPosterConfigState(prev => ({ ...prev, ...config }));
  }, []);

  const setFrameConfig = useCallback((config: Partial<FrameConfig>) => {
    setFrameConfigState(prev => ({ ...prev, ...config }));
  }, []);

  const exportAsSVG = useCallback((geometry: StarMapGeometry, theme: Theme) => {
    try {
      setError(null);
      exportSVG(geometry, exportConfig, theme);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    }
  }, [exportConfig]);

  const exportAsPNG = useCallback(async (
    stars: CatalogStar[],
    observer: Observer,
    renderOptions: RenderOptions,
  ) => {
    try {
      setIsExporting(true);
      setError(null);
      await exportPNG(stars, observer, renderOptions, exportConfig);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [exportConfig]);

  const exportAsPoster = useCallback(async (geometry: StarMapGeometry, theme: Theme) => {
    try {
      setIsExporting(true);
      setError(null);
      await exportPoster(geometry, posterConfig, theme);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [posterConfig]);

  const getSVGPreview = useCallback((geometry: StarMapGeometry, theme: Theme) => {
    return getSVGString(geometry, exportConfig.widthMm, exportConfig.heightMm, theme, {
      strokeOnly: exportConfig.strokeOnly,
      separateLayers: exportConfig.separateLayers,
    });
  }, [exportConfig]);

  return {
    exportConfig,
    posterConfig,
    frameConfig,
    isExporting,
    error,
    setExportConfig,
    setPosterConfig,
    setFrameConfig,
    exportAsSVG,
    exportAsPNG,
    exportAsPoster,
    getSVGPreview,
  };
}

