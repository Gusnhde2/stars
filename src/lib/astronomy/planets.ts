/**
 * Planet position calculations using astronomy-engine
 */

import { MakeTime, Equator, Horizon, Body, Observer as AstroObserver } from 'astronomy-engine';
import type { Observer } from '@/types/observer';
import type { HorizontalCoordinates } from './coordinates';

export interface PlanetPosition extends HorizontalCoordinates {
  name: string;
  magnitude: number;
}

/**
 * Get positions of visible planets
 */
export function getPlanetPositions(observer: Observer): PlanetPosition[] {
  const time = MakeTime(observer.date);
  const astroObserver = new AstroObserver(observer.latitude, observer.longitude, observer.elevation);
  
  const planets: PlanetPosition[] = [];
  
  // Visible planets (excluding Earth)
  const planetBodies = [
    { body: Body.Mercury, name: 'Mercury', mag: 0.0 },
    { body: Body.Venus, name: 'Venus', mag: -4.0 },
    { body: Body.Mars, name: 'Mars', mag: 0.0 },
    { body: Body.Jupiter, name: 'Jupiter', mag: -2.0 },
    { body: Body.Saturn, name: 'Saturn', mag: 0.0 },
  ];
  
  for (const { body, name, mag } of planetBodies) {
    try {
      const equ = Equator(body, time, astroObserver, true, true);
      const hor = Horizon(time, astroObserver, equ.ra, equ.dec, 'normal');
      
      // Only include planets above horizon
      if (hor.altitude > 0) {
        planets.push({
          altitude: hor.altitude,
          azimuth: hor.azimuth,
          name,
          magnitude: mag,
        });
      }
    } catch (error) {
      // Planet may not be visible at this time
      console.debug(`Planet ${name} not visible:`, error);
    }
  }
  
  return planets;
}

