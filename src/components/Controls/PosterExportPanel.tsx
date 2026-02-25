'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import type { PosterConfig, PaperFormat, PaperOrientation, PosterStyle } from '@/types/export';
import type { StarMapGeometry } from '@/lib/geometry/types';
import type { Theme } from '@/types/render';
import { PAPER_SIZES } from '@/types/export';
import { generatePosterPreview } from '@/lib/export/poster-export';

interface PosterExportPanelProps {
  posterConfig: PosterConfig;
  onPosterConfigChange: (config: Partial<PosterConfig>) => void;
  onExport: () => void;
  isExporting: boolean;
  geometry: StarMapGeometry | null;
  theme: Theme;
}

const PAPER_FORMAT_OPTIONS: { value: PaperFormat; label: string; category: string }[] = [
  { value: 'a4', label: 'A4', category: 'Standard' },
  { value: 'a3', label: 'A3', category: 'Standard' },
  { value: 'a2', label: 'A2', category: 'Large' },
  { value: 'letter', label: 'Letter', category: 'Standard' },
  { value: 'square-20', label: '20×20 cm', category: 'Square' },
  { value: 'square-30', label: '30×30 cm', category: 'Square' },
  { value: 'postcard', label: 'Postcard', category: 'Gift' },
  { value: '4x6', label: '4×6"', category: 'Gift' },
  { value: '5x7', label: '5×7"', category: 'Gift' },
  { value: '8x10', label: '8×10"', category: 'Gift' },
];

const STYLE_OPTIONS: { value: PosterStyle; label: string; description: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Clean & simple' },
  { value: 'elegant', label: 'Elegant', description: 'Gold accents' },
  { value: 'celestial', label: 'Celestial', description: 'Dreamy & soft' },
  { value: 'modern', label: 'Modern', description: 'Bold & sharp' },
];

export function PosterExportPanel({
  posterConfig,
  onPosterConfigChange,
  onExport,
  isExporting,
  geometry,
  theme,
}: PosterExportPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate preview with debounce
  useEffect(() => {
    if (!geometry) return;

    // Clear previous timeout
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    // Debounce preview generation
    previewTimeoutRef.current = setTimeout(async () => {
      try {
        const url = await generatePosterPreview(geometry, posterConfig, theme, 200);
        setPreviewUrl(url);
      } catch (e) {
        console.error('Preview generation failed:', e);
      }
    }, 300);

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [geometry, posterConfig, theme]);

  const handleFormatChange = useCallback((format: PaperFormat) => {
    onPosterConfigChange({ paperFormat: format });
  }, [onPosterConfigChange]);

  const handleOrientationChange = useCallback((orientation: PaperOrientation) => {
    onPosterConfigChange({ orientation });
  }, [onPosterConfigChange]);

  const handleStyleChange = useCallback((style: PosterStyle) => {
    onPosterConfigChange({ style });
  }, [onPosterConfigChange]);

  const handleInputChange = useCallback((field: keyof PosterConfig, value: string | boolean) => {
    onPosterConfigChange({ [field]: value });
  }, [onPosterConfigChange]);

  const paperSize = PAPER_SIZES[posterConfig.paperFormat];
  const isSquare = paperSize.isSquare;

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-2 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Poster / Gift Card
      </h3>

      {/* Preview Thumbnail */}
      {previewUrl && (
        <div className="relative">
          <div className="bg-neutral-900 rounded-lg p-3 flex justify-center">
            <img 
              src={previewUrl} 
              alt="Poster preview" 
              className="max-h-40 rounded shadow-lg shadow-black/40 border border-neutral-700"
            />
          </div>
          <div className="absolute top-2 right-2 text-xs text-neutral-500 bg-neutral-900/80 px-2 py-0.5 rounded">
            Preview
          </div>
        </div>
      )}

      {/* Paper Format */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Paper Size</label>
        <div className="grid grid-cols-5 gap-1.5">
          {PAPER_FORMAT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFormatChange(option.value)}
              title={`${option.label} (${PAPER_SIZES[option.value].widthMm}×${PAPER_SIZES[option.value].heightMm}mm)`}
              className={`py-2 px-1 rounded text-xs transition-all ${
                posterConfig.paperFormat === option.value
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700 hover:text-neutral-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orientation (only for non-square) */}
      {!isSquare && (
        <div>
          <label className="block text-xs text-neutral-500 mb-2">Orientation</label>
          <div className="flex gap-2">
            {(['portrait', 'landscape'] as PaperOrientation[]).map((orientation) => (
              <button
                key={orientation}
                onClick={() => handleOrientationChange(orientation)}
                className={`flex-1 py-2.5 rounded-lg text-xs capitalize flex items-center justify-center gap-2 transition-all ${
                  posterConfig.orientation === orientation
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
                }`}
              >
                <span className={`block border border-current ${
                  orientation === 'portrait' ? 'w-3 h-4' : 'w-4 h-3'
                } rounded-sm`} />
                {orientation}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Style Selection */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Style</label>
        <div className="grid grid-cols-2 gap-2">
          {STYLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStyleChange(option.value)}
              className={`py-2.5 px-3 rounded-lg text-left transition-all ${
                posterConfig.style === option.value
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
              }`}
            >
              <div className="text-xs font-medium">{option.label}</div>
              <div className="text-[10px] opacity-60">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Title</label>
        <input
          type="text"
          value={posterConfig.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="The Night We Met"
          className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-colors"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Subtitle (optional)</label>
        <input
          type="text"
          value={posterConfig.subtitle}
          onChange={(e) => handleInputChange('subtitle', e.target.value)}
          placeholder="e.g. Paris, France or Our First Date"
          className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-colors"
        />
      </div>

      {/* Personal Note */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Personal Message</label>
        <textarea
          value={posterConfig.note}
          onChange={(e) => handleInputChange('note', e.target.value)}
          placeholder="Write a heartfelt message..."
          rows={3}
          className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-colors resize-none"
        />
      </div>

      {/* Display Options */}
      <div className="space-y-2.5">
        <label className="block text-xs text-neutral-500 mb-2">Display</label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={posterConfig.showDate}
            onChange={(e) => handleInputChange('showDate', e.target.checked)}
            className="w-4 h-4 accent-rose-500 rounded"
          />
          <span className="text-sm text-neutral-300 group-hover:text-neutral-200 transition-colors">Show Date</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={posterConfig.showTime}
            onChange={(e) => handleInputChange('showTime', e.target.checked)}
            className="w-4 h-4 accent-rose-500 rounded"
          />
          <span className="text-sm text-neutral-300 group-hover:text-neutral-200 transition-colors">Show Time</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={posterConfig.showCoordinates}
            onChange={(e) => handleInputChange('showCoordinates', e.target.checked)}
            className="w-4 h-4 accent-rose-500 rounded"
          />
          <span className="text-sm text-neutral-300 group-hover:text-neutral-200 transition-colors">Show Coordinates</span>
        </label>
      </div>

      {/* Map Size */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Map Size</label>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => handleInputChange('mapSize', size)}
              className={`flex-1 py-2 rounded-lg text-xs capitalize transition-all ${
                posterConfig.mapSize === size
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Font Style */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Font Style</label>
        <div className="flex gap-2">
          {([
            { value: 'serif', label: 'Serif', sample: 'Aa' },
            { value: 'sans', label: 'Sans', sample: 'Aa' },
            { value: 'mono', label: 'Mono', sample: 'Aa' },
          ] as const).map((font) => (
            <button
              key={font.value}
              onClick={() => handleInputChange('fontStyle', font.value)}
              className={`flex-1 py-2.5 rounded-lg text-xs transition-all ${
                posterConfig.fontStyle === font.value
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
              }`}
            >
              <span className={`block text-lg ${
                font.value === 'serif' ? 'font-serif' : 
                font.value === 'sans' ? 'font-sans' : 'font-mono'
              }`}>{font.sample}</span>
              <span className="text-[10px] opacity-70">{font.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Print Quality</label>
        <div className="flex gap-2">
          {([300, 600] as const).map((dpi) => (
            <button
              key={dpi}
              onClick={() => onPosterConfigChange({ dpi })}
              className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                posterConfig.dpi === dpi
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
              }`}
            >
              {dpi} DPI
              <span className="block text-[10px] opacity-60">
                {dpi === 300 ? 'Standard' : 'High Quality'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={isExporting}
        className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:from-neutral-700 disabled:to-neutral-700 rounded-lg text-white font-medium transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Poster
          </>
        )}
      </button>

      {/* Info */}
      <div className="text-xs text-neutral-600 text-center space-y-1">
        <p>
          {paperSize.name} • {posterConfig.orientation} • {posterConfig.dpi} DPI
        </p>
        <p className="text-neutral-700">
          Perfect for printing, framing, or gifting
        </p>
      </div>
    </div>
  );
}

