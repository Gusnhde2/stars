'use client';

import { useMemo, useState, useCallback } from 'react';
import type { Observer } from '@/types/observer';
import type { RenderOptions, Theme } from '@/types/render';
import { DEFAULT_RENDER_OPTIONS } from '@/types/render';
import type { CatalogStar, ProjectedStar } from '@/types/star';
import type { StarMapGeometry } from '@/lib/geometry/types';
import { loadCatalog, getStarsByMagnitude } from '@/lib/astronomy/catalog';
import { createDefaultObserver } from '@/lib/astronomy/observer';
import { buildStarMapGeometry, getProjectedStars } from '@/lib/geometry/builder';

interface UseStarMapOptions {
  initialObserver?: Observer;
  initialRenderOptions?: Partial<RenderOptions>;
}

interface UseStarMapReturn {
  // State
  observer: Observer;
  renderOptions: RenderOptions;
  stars: CatalogStar[];
  projectedStars: ProjectedStar[];
  geometry: StarMapGeometry | null;
  
  // Setters
  setObserver: (observer: Observer) => void;
  setRenderOptions: (options: Partial<RenderOptions>) => void;
  setTheme: (theme: Theme) => void;
  setMagnitudeLimit: (limit: number) => void;
  
  // Computed
  visibleStarCount: number;
  catalogStarCount: number;
}

export function useStarMap(options: UseStarMapOptions = {}): UseStarMapReturn {
  const {
    initialObserver = createDefaultObserver(),
    initialRenderOptions = {},
  } = options;
  
  // State
  const [observer, setObserver] = useState<Observer>(initialObserver);
  const [renderOptions, setRenderOptionsState] = useState<RenderOptions>({
    ...DEFAULT_RENDER_OPTIONS,
    ...initialRenderOptions,
  });
  
  // Load catalog
  const catalog = useMemo(() => loadCatalog(), []);
  
  // Filter stars by magnitude
  const stars = useMemo(
    () => getStarsByMagnitude(renderOptions.magnitudeLimit),
    [renderOptions.magnitudeLimit]
  );
  
  // Project stars
  const projectedStars = useMemo(
    () => getProjectedStars(stars, observer, renderOptions),
    [stars, observer, renderOptions]
  );
  
  // Build full geometry (for canvas rendering)
  const geometry = useMemo(
    () => buildStarMapGeometry(stars, observer, renderOptions, 500),
    [stars, observer, renderOptions]
  );
  
  // Setters
  const setRenderOptions = useCallback((newOptions: Partial<RenderOptions>) => {
    setRenderOptionsState(prev => ({ ...prev, ...newOptions }));
  }, []);
  
  const setTheme = useCallback((theme: Theme) => {
    setRenderOptionsState(prev => ({ ...prev, theme }));
  }, []);
  
  const setMagnitudeLimit = useCallback((magnitudeLimit: number) => {
    setRenderOptionsState(prev => ({ ...prev, magnitudeLimit }));
  }, []);
  
  return {
    observer,
    renderOptions,
    stars,
    projectedStars,
    geometry,
    setObserver,
    setRenderOptions,
    setTheme,
    setMagnitudeLimit,
    visibleStarCount: projectedStars.length,
    catalogStarCount: catalog.meta.count,
  };
}

