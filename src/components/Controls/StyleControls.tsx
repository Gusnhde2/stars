'use client';

import { useCallback } from 'react';
import type { RenderOptions, Theme, StarStyle } from '@/types/render';

interface StyleControlsProps {
  renderOptions: RenderOptions;
  onRenderOptionsChange: (options: Partial<RenderOptions>) => void;
}

export function StyleControls({ renderOptions, onRenderOptionsChange }: StyleControlsProps) {
  const handleThemeChange = useCallback((theme: Theme) => {
    onRenderOptionsChange({ theme });
  }, [onRenderOptionsChange]);
  
  const handleMagnitudeLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onRenderOptionsChange({ magnitudeLimit: parseFloat(e.target.value) });
  }, [onRenderOptionsChange]);
  
  const handleToggle = useCallback((key: keyof RenderOptions) => {
    onRenderOptionsChange({ [key]: !renderOptions[key] });
  }, [renderOptions, onRenderOptionsChange]);
  
  const handleStarSizeChange = useCallback((key: 'starSizeMin' | 'starSizeMax', value: number) => {
    // Ensure we always have a valid number
    const safeValue = isNaN(value) ? (key === 'starSizeMin' ? 0.5 : 4) : value;
    onRenderOptionsChange({ [key]: safeValue });
  }, [onRenderOptionsChange]);
  
  const handleStarStyleChange = useCallback((style: StarStyle) => {
    onRenderOptionsChange({ starStyle: style });
  }, [onRenderOptionsChange]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Style</h3>
      
      {/* Theme Selection */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Theme</label>
        <div className="flex gap-2">
          {(['dark', 'light', 'monochrome'] as Theme[]).map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`flex-1 py-2 rounded-lg text-xs capitalize transition-colors ${
                renderOptions.theme === theme
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
      
      {/* Magnitude Limit */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-neutral-500">Magnitude Limit</label>
          <span className="text-xs text-neutral-400">{renderOptions.magnitudeLimit.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={2}
          max={6.5}
          step={0.5}
          value={renderOptions.magnitudeLimit}
          onChange={handleMagnitudeLimitChange}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-xs text-neutral-600 mt-1">
          <span>Bright only</span>
          <span>Include faint</span>
        </div>
      </div>
      
      {/* Star Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Min Star Size</label>
          <input
            type="number"
            value={renderOptions.starSizeMin ?? 0.5}
            onChange={(e) => handleStarSizeChange('starSizeMin', parseFloat(e.target.value) || 0.5)}
            min={0.1}
            max={2}
            step={0.1}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Max Star Size</label>
          <input
            type="number"
            value={renderOptions.starSizeMax ?? 4}
            onChange={(e) => handleStarSizeChange('starSizeMax', parseFloat(e.target.value) || 4)}
            min={1}
            max={10}
            step={0.5}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>
      
      {/* Star Style Selection */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Star Style</label>
        <div className="flex gap-2">
          {(['dots', 'glow', 'spikes'] as StarStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => handleStarStyleChange(style)}
              className={`flex-1 py-2 rounded-lg text-xs capitalize transition-colors ${
                renderOptions.starStyle === style
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
              }`}
            >
              {style === 'dots' ? '● Dots' : style === 'glow' ? '✦ Glow' : '✴ Spikes'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Toggle Options */}
      <div className="space-y-2">
        <label className="block text-xs text-neutral-500 mb-2">Display Options</label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showHorizon}
            onChange={() => handleToggle('showHorizon')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Horizon</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showCardinals}
            onChange={() => handleToggle('showCardinals')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Cardinals (N/E/S/W)</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showGrid}
            onChange={() => handleToggle('showGrid')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Altitude Grid</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showTopoContours}
            onChange={() => handleToggle('showTopoContours')}
            className="w-4 h-4 accent-blue-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Topo Contours</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showDegreeRing}
            onChange={() => handleToggle('showDegreeRing')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Degree Ring</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showConstellations}
            onChange={() => handleToggle('showConstellations')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Constellation Lines</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showConstellationNames}
            onChange={() => handleToggle('showConstellationNames')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Constellation Names</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showStarNames}
            onChange={() => handleToggle('showStarNames')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Star Names</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showPlanets}
            onChange={() => handleToggle('showPlanets')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Planets</span>
        </label>
        
        <div className="border-t border-neutral-800 my-2 pt-2">
          <span className="text-xs text-neutral-600">Map Info</span>
        </div>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showMapCoordinates}
            onChange={() => handleToggle('showMapCoordinates')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Coordinates on Map</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={renderOptions.showMapDate}
            onChange={() => handleToggle('showMapDate')}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-sm text-neutral-300">Show Date on Map</span>
        </label>
      </div>
    </div>
  );
}

