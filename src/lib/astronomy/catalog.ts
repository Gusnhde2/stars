/**
 * Star catalog loader and filtering utilities
 */

import type { CatalogStar, StarCatalog } from '@/types/star';
import starData from '@/data/stars.json';

// Cache the loaded catalog
let catalogCache: StarCatalog | null = null;

/**
 * Load the star catalog
 */
export function loadCatalog(): StarCatalog {
  if (catalogCache) {
    return catalogCache;
  }
  
  catalogCache = starData as StarCatalog;
  return catalogCache;
}

/**
 * Get stars filtered by magnitude limit
 */
export function getStarsByMagnitude(magnitudeLimit: number): CatalogStar[] {
  const catalog = loadCatalog();
  return catalog.stars.filter(star => star.mag <= magnitudeLimit);
}

/**
 * Get a specific star by Hipparcos ID
 */
export function getStarByHip(hip: number): CatalogStar | undefined {
  const catalog = loadCatalog();
  return catalog.stars.find(star => star.hip === hip);
}

/**
 * Get stars by name (partial match)
 */
export function searchStarsByName(query: string): CatalogStar[] {
  const catalog = loadCatalog();
  const lowerQuery = query.toLowerCase();
  return catalog.stars.filter(
    star => star.name && star.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get the brightest N stars
 */
export function getBrightestStars(count: number): CatalogStar[] {
  const catalog = loadCatalog();
  return [...catalog.stars]
    .sort((a, b) => a.mag - b.mag)
    .slice(0, count);
}

/**
 * Get catalog statistics
 */
export function getCatalogStats(): {
  totalStars: number;
  brightestMag: number;
  faintestMag: number;
  namedStars: number;
} {
  const catalog = loadCatalog();
  const mags = catalog.stars.map(s => s.mag);
  
  return {
    totalStars: catalog.stars.length,
    brightestMag: Math.min(...mags),
    faintestMag: Math.max(...mags),
    namedStars: catalog.stars.filter(s => s.name).length,
  };
}

