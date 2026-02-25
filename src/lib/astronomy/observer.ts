/**
 * Observer position handling utilities
 */

import type { Observer, ObserverInput } from '@/types/observer';

/**
 * Create an Observer from input values
 */
export function createObserver(input: ObserverInput): Observer {
  return {
    latitude: input.latitude,
    longitude: input.longitude,
    elevation: input.elevation,
    date: new Date(input.dateTime),
  };
}

/**
 * Create default observer (Greenwich, now)
 */
export function createDefaultObserver(): Observer {
  return {
    latitude: 51.4772,      // Greenwich Observatory
    longitude: -0.0005,
    elevation: 0,
    date: new Date(),
  };
}

/**
 * Validate observer coordinates
 */
export function validateObserver(observer: Observer): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (observer.latitude < -90 || observer.latitude > 90) {
    errors.push('Latitude must be between -90 and 90 degrees');
  }
  
  if (observer.longitude < -180 || observer.longitude > 180) {
    errors.push('Longitude must be between -180 and 180 degrees');
  }
  
  if (observer.elevation < -500 || observer.elevation > 10000) {
    errors.push('Elevation must be between -500 and 10000 meters');
  }
  
  if (isNaN(observer.date.getTime())) {
    errors.push('Invalid date');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format observer location as string
 */
export function formatLocation(observer: Observer): string {
  const latDir = observer.latitude >= 0 ? 'N' : 'S';
  const lonDir = observer.longitude >= 0 ? 'E' : 'W';
  const lat = Math.abs(observer.latitude).toFixed(2);
  const lon = Math.abs(observer.longitude).toFixed(2);
  return `${lat}°${latDir}, ${lon}°${lonDir}`;
}

/**
 * Format observer date/time as string
 */
export function formatDateTime(observer: Observer): string {
  return observer.date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

/**
 * Convert observer to input format for forms
 */
export function observerToInput(observer: Observer): ObserverInput {
  return {
    latitude: observer.latitude,
    longitude: observer.longitude,
    elevation: observer.elevation,
    dateTime: observer.date.toISOString().slice(0, 16), // Format for datetime-local input
  };
}

/**
 * Common locations for quick selection
 */
export const PRESET_LOCATIONS = [
  { name: 'Greenwich, UK', latitude: 51.4772, longitude: -0.0005, elevation: 0 },
  { name: 'New York, USA', latitude: 40.7128, longitude: -74.0060, elevation: 10 },
  { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, elevation: 40 },
  { name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093, elevation: 58 },
  { name: 'Paris, France', latitude: 48.8566, longitude: 2.3522, elevation: 35 },
  { name: 'Cape Town, South Africa', latitude: -33.9249, longitude: 18.4241, elevation: 0 },
  { name: 'Mauna Kea, Hawaii', latitude: 19.8207, longitude: -155.4680, elevation: 4207 },
  { name: 'North Pole', latitude: 90, longitude: 0, elevation: 0 },
  { name: 'South Pole', latitude: -90, longitude: 0, elevation: 2835 },
] as const;

