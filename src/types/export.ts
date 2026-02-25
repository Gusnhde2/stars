// Export configuration interfaces

export type ExportFormat = 'svg' | 'png' | 'pdf';
export type ExportShape = 'square' | 'circle';
export type ExportDPI = 300 | 600;

export interface ExportConfig {
  format: ExportFormat;
  widthMm: number;                  // Physical width in mm
  heightMm: number;                 // Physical height in mm
  dpi: ExportDPI;                   // For PNG export
  shape: ExportShape;
  strokeOnly: boolean;              // For manufacturing
  separateLayers: boolean;          // Stars, text, guides as groups
}



// Paper format definitions
export type PaperFormat = 'a4' | 'a3' | 'a2' | 'letter' | 'square-20' | 'square-30' | 'postcard' | '4x6' | '5x7' | '8x10';
export type PaperOrientation = 'portrait' | 'landscape';
export type PosterStyle = 'minimal' | 'elegant' | 'celestial' | 'modern';
export type ProductFormat = 'print' | 'canvas' | 'framed';
export type FrameFinish = 'wood' | 'white' | 'black';
export type ProductLayout = 'portrait' | 'square';

export interface PaperSize {
  name: string;
  widthMm: number;
  heightMm: number;
  isSquare?: boolean;
}

export const PAPER_SIZES: Record<PaperFormat, PaperSize> = {
  'a4': { name: 'A4', widthMm: 210, heightMm: 297 },
  'a3': { name: 'A3', widthMm: 297, heightMm: 420 },
  'a2': { name: 'A2', widthMm: 420, heightMm: 594 },
  'letter': { name: 'Letter', widthMm: 216, heightMm: 279 },
  'square-20': { name: '20×20 cm', widthMm: 200, heightMm: 200, isSquare: true },
  'square-30': { name: '30×30 cm', widthMm: 300, heightMm: 300, isSquare: true },
  'postcard': { name: 'Postcard', widthMm: 148, heightMm: 105 },
  '4x6': { name: '4×6"', widthMm: 102, heightMm: 152 },
  '5x7': { name: '5×7"', widthMm: 127, heightMm: 178 },
  '8x10': { name: '8×10"', widthMm: 203, heightMm: 254 },
};

export interface PosterConfig {
  format: ExportFormat;
  paperFormat: PaperFormat;
  orientation: PaperOrientation;
  dpi: ExportDPI;
  style: PosterStyle;
  // Content
  title: string;                    // Main title (e.g., "The Night We Met")
  subtitle: string;                 // Subtitle line (e.g., location)
  note: string;                     // Personal message/dedication
  showCoordinates: boolean;         // Show lat/long
  showDate: boolean;                // Show formatted date
  showTime: boolean;                // Show time
  // Typography
  fontStyle: 'serif' | 'sans' | 'mono';
  // Layout
  mapPosition: 'center' | 'top' | 'bottom';
  mapSize: 'small' | 'medium' | 'large';
}

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: 'svg',
  widthMm: 200,
  heightMm: 200,
  dpi: 300,
  shape: 'circle',
  strokeOnly: false,
  separateLayers: true,
};



export const DEFAULT_POSTER_CONFIG: PosterConfig = {
  format: 'png',
  paperFormat: 'a4',
  orientation: 'portrait',
  dpi: 300,
  style: 'elegant',
  title: 'The Night Sky',
  subtitle: '',
  note: '',
  showCoordinates: true,
  showDate: true,
  showTime: true,
  fontStyle: 'serif',
  mapPosition: 'center',
  mapSize: 'large',
};

export interface FrameConfig {
  format: ProductFormat;
  frameFinish: FrameFinish;
  layout: ProductLayout;
  size: { width: number; height: number; price: number; label: string };
}

export const FRAME_SIZES = [
  { width: 300, height: 400, price: 139, label: '30 x 40cm' },
  { width: 500, height: 700, price: 175, label: '50 x 70cm' },
  { width: 600, height: 800, price: 199, label: '60 x 80cm' },
] as const;

export const DEFAULT_FRAME_CONFIG: FrameConfig = {
  format: 'framed',
  frameFinish: 'black',
  layout: 'portrait',
  size: FRAME_SIZES[0],
};

