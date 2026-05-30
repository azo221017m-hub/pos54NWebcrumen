// Utilidades para configurar el ancho de papel de impresoras térmicas.
// El ancho se almacena por dispositivo en localStorage para soportar
// distintos modelos de impresora sin cambios en la base de datos.

const STORAGE_KEY = 'pos_paper_width';

export const PAPER_WIDTHS = ['48mm', '58mm', '80mm'] as const;
export type PaperWidth = (typeof PAPER_WIDTHS)[number];

export const DEFAULT_PAPER_WIDTH: PaperWidth = '58mm';

interface PaperConfig {
  /** CSS width value used for <body> and @page */
  cssWidth: string;
  /** Base font size in px */
  fontSize: number;
  /** Small font size in px (labels, notes) */
  fontSizeSm: number;
  /** Title / negocio name font size in px */
  fontSizeLg: number;
  /** Popup window width for window.open() */
  popupWidth: number;
}

const PAPER_CONFIGS: Record<PaperWidth, PaperConfig> = {
  '48mm': { cssWidth: '48mm', fontSize: 10, fontSizeSm: 9,  fontSizeLg: 12, popupWidth: 260 },
  '58mm': { cssWidth: '58mm', fontSize: 12, fontSizeSm: 10, fontSizeLg: 14, popupWidth: 300 },
  '80mm': { cssWidth: '80mm', fontSize: 13, fontSizeSm: 11, fontSizeLg: 16, popupWidth: 380 },
};

/**
 * Returns the configured paper width for this device (localStorage) or the default.
 */
export function getPaperWidth(): PaperWidth {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (PAPER_WIDTHS as readonly string[]).includes(stored)) {
    return stored as PaperWidth;
  }
  return DEFAULT_PAPER_WIDTH;
}

/**
 * Saves the paper width preference for this device.
 */
export function setPaperWidth(width: PaperWidth): void {
  localStorage.setItem(STORAGE_KEY, width);
}

/**
 * Returns the PaperConfig for a given width string, falling back to 58mm.
 */
export function getPaperConfig(width?: string): PaperConfig {
  const key = (width && (PAPER_WIDTHS as readonly string[]).includes(width) ? width : getPaperWidth()) as PaperWidth;
  return PAPER_CONFIGS[key];
}
