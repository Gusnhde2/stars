'use client';

import { useState, useCallback } from 'react';
import type { Observer } from '@/types/observer';
import { PRESET_LOCATIONS } from '@/lib/astronomy/observer';

interface LocationInputProps {
  observer: Observer;
  onObserverChange: (observer: Observer) => void;
}

export function LocationInput({ observer, onObserverChange }: LocationInputProps) {
  const [showPresets, setShowPresets] = useState(false);
  
  const handleLatitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const latitude = parseFloat(e.target.value);
    if (!isNaN(latitude) && latitude >= -90 && latitude <= 90) {
      onObserverChange({ ...observer, latitude });
    }
  }, [observer, onObserverChange]);
  
  const handleLongitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const longitude = parseFloat(e.target.value);
    if (!isNaN(longitude) && longitude >= -180 && longitude <= 180) {
      onObserverChange({ ...observer, longitude });
    }
  }, [observer, onObserverChange]);
  
  const handleElevationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const elevation = parseFloat(e.target.value);
    if (!isNaN(elevation)) {
      onObserverChange({ ...observer, elevation });
    }
  }, [observer, onObserverChange]);
  
  const handlePresetSelect = useCallback((preset: typeof PRESET_LOCATIONS[number]) => {
    onObserverChange({
      ...observer,
      latitude: preset.latitude,
      longitude: preset.longitude,
      elevation: preset.elevation,
    });
    setShowPresets(false);
  }, [observer, onObserverChange]);
  
  const handleUseCurrentLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onObserverChange({
            ...observer,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            elevation: position.coords.altitude || 0,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [observer, onObserverChange]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Location</h3>
        <div className="flex gap-2">
          <button
            onClick={handleUseCurrentLocation}
            className="text-xs px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            📍 Current
          </button>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="text-xs px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Presets
          </button>
        </div>
      </div>
      
      {showPresets && (
        <div className="bg-neutral-800 rounded-lg p-2 space-y-1 max-h-48 overflow-y-auto">
          {PRESET_LOCATIONS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700 rounded transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Latitude</label>
          <input
            type="number"
            value={observer.latitude}
            onChange={handleLatitudeChange}
            min={-90}
            max={90}
            step={0.01}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Longitude</label>
          <input
            type="number"
            value={observer.longitude}
            onChange={handleLongitudeChange}
            min={-180}
            max={180}
            step={0.01}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Elevation (m)</label>
        <input
          type="number"
          value={observer.elevation}
          onChange={handleElevationChange}
          step={1}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:border-amber-500/50"
        />
      </div>
    </div>
  );
}

