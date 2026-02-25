// Star data interfaces

export interface CatalogStar {
  hip: number;           // Hipparcos ID
  ra: number;            // Right Ascension in degrees (0-360)
  dec: number;           // Declination in degrees (-90 to +90)
  mag: number;           // Apparent magnitude
  name?: string;         // Common name (optional)
}

export interface ProjectedStar {
  hip: number;
  x: number;             // Projected X (-1 to 1, normalized)
  y: number;             // Projected Y (-1 to 1, normalized)
  altitude: number;      // Degrees above horizon
  azimuth: number;       // Degrees from North
  magnitude: number;
  radius: number;        // Rendered radius in units
  name?: string;
}

export interface StarCatalog {
  meta: {
    source: string;
    epoch: string;
    count: number;
    magLimit: number;
  };
  stars: CatalogStar[];
}

