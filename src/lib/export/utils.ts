/**
 * Export utility functions
 */

/**
 * Trigger browser download of a string as a file
 */
export function downloadString(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Trigger browser download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert mm to pixels at a given DPI
 */
export function mmToPixels(mm: number, dpi: number): number {
  // 1 inch = 25.4 mm
  const inches = mm / 25.4;
  return Math.round(inches * dpi);
}

/**
 * Convert pixels to mm at a given DPI
 */
export function pixelsToMm(pixels: number, dpi: number): number {
  const inches = pixels / dpi;
  return inches * 25.4;
}

/**
 * Generate a filename for export
 */
export function generateFilename(
  location: string,
  date: Date,
  format: string
): string {
  const locationSlug = location.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  const dateStr = date.toISOString().slice(0, 10);
  return `starmap-${locationSlug}-${dateStr}.${format}`;
}

