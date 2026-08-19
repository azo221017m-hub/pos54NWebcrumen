// PrinterProfile: configura ancho de papel + caracteres por línea para que los tickets
// (comanda cocina, ticket cliente, cortes/movimientos) se rendericen completos según la
// impresora conectada, sin truncar información. Se elige por dispositivo (localStorage)
// ya que cada equipo/caja puede tener una impresora distinta.

const STORAGE_KEY = 'pos_paper_width';

export const PAPER_WIDTHS = ['48mm', '58mm', '76mm', '80mm', 'A4'] as const;
export type PaperWidth = (typeof PAPER_WIDTHS)[number];

export const DEFAULT_PAPER_WIDTH: PaperWidth = '58mm';

export interface PaperConfig {
  /** CSS width value used for <body> */
  cssWidth: string;
  /** Base font size in px */
  fontSize: number;
  /** Medium font size in px (item details, rows) */
  fontSizeMd: number;
  /** Small font size in px (labels, notes) */
  fontSizeSm: number;
  /** Title / negocio name font size in px */
  fontSizeLg: number;
  /** Popup window width for window.open() */
  popupWidth: number;
  /** Columnas de texto disponibles a fuente monoespaciada (tickets de texto plano) */
  charactersPerLine: number;
  /** 'roll' = impresora térmica de rollo continuo, 'sheet' = hoja tamaño fijo (A4) */
  kind: 'roll' | 'sheet';
}

const PAPER_CONFIGS: Record<PaperWidth, PaperConfig> = {
  '48mm': { cssWidth: '48mm', fontSize: 10, fontSizeMd: 9,  fontSizeSm: 9,  fontSizeLg: 12, popupWidth: 260, charactersPerLine: 24, kind: 'roll' },
  '58mm': { cssWidth: '58mm', fontSize: 12, fontSizeMd: 11, fontSizeSm: 10, fontSizeLg: 14, popupWidth: 300, charactersPerLine: 32, kind: 'roll' },
  '76mm': { cssWidth: '76mm', fontSize: 13, fontSizeMd: 12, fontSizeSm: 11, fontSizeLg: 15, popupWidth: 360, charactersPerLine: 42, kind: 'roll' },
  '80mm': { cssWidth: '80mm', fontSize: 13, fontSizeMd: 12, fontSizeSm: 11, fontSizeLg: 16, popupWidth: 380, charactersPerLine: 48, kind: 'roll' },
  'A4':   { cssWidth: '180mm', fontSize: 14, fontSizeMd: 13, fontSizeSm: 12, fontSizeLg: 18, popupWidth: 800, charactersPerLine: 64, kind: 'sheet' },
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

/**
 * Bloque @media print correcto para el perfil dado: rollo continuo (ancho fijo, alto
 * automático, sin margen) o A4 (hoja tamaño fijo, con margen de impresión estándar).
 * Centraliza esta regla para que los 6+ generadores de ticket del proyecto no dupliquen
 * (e inevitablemente desincronicen) la lógica de @page por tipo de papel.
 */
export function getMediaPrintCss(cfg: PaperConfig): string {
  if (cfg.kind === 'sheet') {
    return `@media print { @page { size: A4; margin: 15mm; } }`;
  }
  return `@media print { html, body { width: ${cfg.cssWidth}; } @page { size: ${cfg.cssWidth} auto; margin: 0; } }`;
}
