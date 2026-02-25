// Render options interfaces

export type Theme = 'dark' | 'light' | 'monochrome' | 'sepia';
export type GridStyle = 'none' | 'altitude' | 'equatorial' | 'both';
export type StarStyle = 'dots' | 'glow' | 'spikes';

export interface RenderOptions {
  magnitudeLimit: number;           // Default 6.0
  starSizeMin: number;              // Minimum star radius
  starSizeMax: number;              // Maximum star radius (for mag ~ -1)
  showConstellations: boolean;
  showConstellationNames: boolean;
  showPlanets: boolean;
  showStarNames: boolean;
  showHorizon: boolean;
  showCardinals: boolean;
  showGrid: boolean;
  showDegreeRing: boolean;
  showTopoContours: boolean;        // Topographic altitude contour lines
  showMapCoordinates: boolean;      // Show coordinates on the map
  showMapDate: boolean;             // Show date/time on the map
  starStyle: StarStyle;             // Star rendering style
  gridStyle: GridStyle;             // Grid style option
  theme: Theme;
}

export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  magnitudeLimit: 6.0,
  starSizeMin: 0.2,
  starSizeMax: 2.0,
  showConstellations: true,
  showConstellationNames: true,
  showPlanets: true,
  showStarNames: true,
  showHorizon: true,
  showCardinals: true,
  showGrid: false,
  showDegreeRing: true,
  showTopoContours: false,
  showMapCoordinates: true,
  showMapDate: true,
  starStyle: 'glow',
  gridStyle: 'none',
  theme: 'dark',
};

export interface ThemeColors {
  background: string;
  stars: string;
  starGlow: string;
  horizon: string;
  cardinals: string;
  grid: string;
  text: string;
  constellations: string;
  planets: string;
  starNames: string;
  constellationNames: string;
  degreeRing: string;
  topoContours: string[];  // Array of colors for different altitude bands
}

export const THEME_COLORS: Record<Theme, ThemeColors> = {
  dark: {
    background: '#0a0a0f',
    stars: '#ffffff',
    starGlow: '#6688ff',
    horizon: '#1a1a2e',
    cardinals: '#666688',
    grid: '#3a3a6a',
    text: '#888899',
    constellations: '#444466',
    planets: '#ffaa44',
    starNames: '#aaaaaa',
    constellationNames: '#8888aa',
    degreeRing: '#3a3a5a',
    topoContours: ['#1a1a3a', '#252550', '#303068', '#3a3a80', '#454598', '#5050b0'],
  },
  light: {
    background: '#ffffff',
    stars: '#000000',
    starGlow: '#4466cc',
    horizon: '#e0e0e0',
    cardinals: '#666666',
    grid: '#aaaacc',
    text: '#444444',
    constellations: '#888888',
    planets: '#ff6600',
    starNames: '#333333',
    constellationNames: '#555555',
    degreeRing: '#999999',
    topoContours: ['#f0f0f8', '#e0e0f0', '#d0d0e8', '#c0c0e0', '#b0b0d8', '#a0a0d0'],
  },
  monochrome: {
    background: '#000000',
    stars: '#ffffff',
    starGlow: '#ffffff',
    horizon: '#333333',
    cardinals: '#ffffff',
    grid: '#444444',
    text: '#cccccc',
    constellations: '#666666',
    planets: '#ffffff',
    starNames: '#aaaaaa',
    constellationNames: '#888888',
    degreeRing: '#555555',
    topoContours: ['#111111', '#1a1a1a', '#222222', '#2a2a2a', '#333333', '#3a3a3a'],
  },
  sepia: {
    background: '#f5f0e6',
    stars: '#2c2416',
    starGlow: '#8b7355',
    horizon: '#d4c9b5',
    cardinals: '#6b5d4d',
    grid: '#c4b8a4',
    text: '#5a4d3c',
    constellations: '#9a8a72',
    planets: '#c4722e',
    starNames: '#6b5d4d',
    constellationNames: '#8b7d68',
    degreeRing: '#b5a890',
    topoContours: ['#ebe3d4', '#e0d6c4', '#d5cab4', '#cabea4', '#bfb294', '#b4a684'],
  },
};

