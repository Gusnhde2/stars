/**
 * Coordinate transformation functions using astronomy-engine
 * Converts celestial coordinates (RA/Dec) to horizontal coordinates (Alt/Az)
 */

import { Observer as AstroObserver, MakeTime, Horizon } from 'astronomy-engine';
import type { Observer } from '@/types/observer';

export interface HorizontalCoordinates {
  altitude: number;  // Degrees above horizon (-90 to +90)
  azimuth: number;   // Degrees from North, clockwise (0-360)
}

/**
 * Convert Right Ascension and Declination to Altitude and Azimuth
 * 
 * @param ra - Right Ascension in degrees (0-360)
 * @param dec - Declination in degrees (-90 to +90)
 * @param observer - Observer location and time
 * @returns Horizontal coordinates (altitude and azimuth)
 */
export function raDecToAltAz(
  ra: number,
  dec: number,
  observer: Observer
): HorizontalCoordinates {
  // Create astronomy-engine observer
  const astroObserver = new AstroObserver(
    observer.latitude,
    observer.longitude,
    observer.elevation
  );
  
  // Create time object from Date
  const time = MakeTime(observer.date);
  
  // Convert RA from degrees to hours (astronomy-engine expects hours)
  const raHours = ra / 15;
  
  // Convert to horizontal coordinates
  // 'normal' refraction model accounts for atmospheric refraction
  const horizontal = Horizon(time, astroObserver, raHours, dec, 'normal');
  
  return {
    altitude: horizontal.altitude,
    azimuth: horizontal.azimuth,
  };
}

/**
 * Check if a celestial object is above the horizon
 */
export function isAboveHorizon(altitude: number): boolean {
  return altitude > 0;
}

/**
 * Calculate Local Sidereal Time for reference
 * This can be useful for debugging coordinate transformations
 */
export function calculateLST(observer: Observer): number {
  // Approximate LST calculation
  const jd = dateToJulianDay(observer.date);
  const T = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * (0.000387933 - T / 38710000);
  const lst = (gmst + observer.longitude) % 360;
  return lst < 0 ? lst + 360 : lst;
}

/**
 * Convert Date to Julian Day
 */
function dateToJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;
  
  return jd;
}

