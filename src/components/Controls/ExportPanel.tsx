'use client';

import { useCallback } from 'react';
import type { ExportConfig, ExportFormat, ExportDPI } from '@/types/export';
import type { StarMapGeometry } from '@/lib/geometry/types';
import type { CatalogStar } from '@/types/star';
import type { Observer } from '@/types/observer';
import type { RenderOptions } from '@/types/render';

interface ExportPanelProps {
  exportConfig: ExportConfig;
  onExportConfigChange: (config: Partial<ExportConfig>) => void;
  onExportSVG: () => void;
  onExportPNG: () => void;
  isExporting: boolean;
}

export function ExportPanel({
  exportConfig,
  onExportConfigChange,
  onExportSVG,
  onExportPNG,
  isExporting,
}: ExportPanelProps) {
  const handleFormatChange = useCallback((format: ExportFormat) => {
    onExportConfigChange({ format });
  }, [onExportConfigChange]);
  
  const handleDPIChange = useCallback((dpi: ExportDPI) => {
    onExportConfigChange({ dpi });
  }, [onExportConfigChange]);
  
  const handleSizeChange = useCallback((widthMm: number) => {
    onExportConfigChange({ widthMm, heightMm: widthMm });
  }, [onExportConfigChange]);
  
  const handleToggle = useCallback((key: 'strokeOnly' | 'separateLayers') => {
    onExportConfigChange({ [key]: !exportConfig[key] });
  }, [exportConfig, onExportConfigChange]);
  
  const handleExport = useCallback(() => {
    if (exportConfig.format === 'svg') {
      onExportSVG();
    } else if (exportConfig.format === 'png') {
      onExportPNG();
    }
  }, [exportConfig.format, onExportSVG, onExportPNG]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">Export</h3>
      
      {/* Format Selection */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Format</label>
        <div className="flex gap-2">
          {(['svg', 'png'] as ExportFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => handleFormatChange(format)}
              className={`flex-1 py-2 rounded-lg text-xs uppercase transition-colors ${
                exportConfig.format === format
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
              }`}
            >
              {format}
            </button>
          ))}
        </div>
      </div>
      
      {/* Size */}
      <div>
        <label className="block text-xs text-neutral-500 mb-2">Size (mm)</label>
        <div className="flex gap-2">
          {[100, 200, 300, 400].map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`flex-1 py-2 rounded-lg text-xs transition-colors ${
                exportConfig.widthMm === size
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      
      {/* DPI (for PNG) */}
      {exportConfig.format === 'png' && (
        <div>
          <label className="block text-xs text-neutral-500 mb-2">Resolution (DPI)</label>
          <div className="flex gap-2">
            {([300, 600] as ExportDPI[]).map((dpi) => (
              <button
                key={dpi}
                onClick={() => handleDPIChange(dpi)}
                className={`flex-1 py-2 rounded-lg text-xs transition-colors ${
                  exportConfig.dpi === dpi
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
                }`}
              >
                {dpi} DPI
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* SVG Options */}
      {exportConfig.format === 'svg' && (
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={exportConfig.strokeOnly}
              onChange={() => handleToggle('strokeOnly')}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-sm text-neutral-300">Stroke Only (for engraving)</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={exportConfig.separateLayers}
              onChange={() => handleToggle('separateLayers')}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-sm text-neutral-300">Separate Layers</span>
          </label>
        </div>
      )}
      
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-neutral-700 disabled:to-neutral-700 rounded-lg text-white font-medium transition-all shadow-lg shadow-amber-900/20"
      >
        {isExporting ? 'Exporting...' : `Export ${exportConfig.format.toUpperCase()}`}
      </button>
      
      {/* Info */}
      <p className="text-xs text-neutral-600 text-center">
        {exportConfig.format === 'svg' 
          ? 'Vector format, ideal for printing & manufacturing'
          : `Raster at ${exportConfig.dpi} DPI (${Math.round(exportConfig.widthMm / 25.4 * exportConfig.dpi)}px)`
        }
      </p>
    </div>
  );
}

