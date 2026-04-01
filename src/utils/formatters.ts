/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

/**
 * Formatea una fecha
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

/**
 * Formatea fecha y hora
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Trunca un texto
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Genera el folio corto de venta: primera letra del tipo de venta + idventa
 * Ejemplo: M123 (Mesa), L456 (Llevar), D789 (Domicilio)
 */
export const getShortFolio = (tipodeventa: string, idventa: number): string => {
  const letra = tipodeventa?.charAt(0) || 'V';
  return `${letra}${idventa}`;
};

/**
 * Extrae el folio corto desde un folioventa completo.
 * El folioventa tiene formato: [claveturno]HHMMSS[Letra][idventa]
 * Esta función extrae la Letra + idventa (últimos caracteres después del timestamp).
 * Si no se puede parsear, retorna el folioventa original.
 */
export const extractShortFolio = (folioventa: string): string => {
  if (!folioventa) return '';
  // El folio tiene formato: [claveturno]HHMMSS[Letra][idventa]
  // La letra del tipo es una sola letra mayúscula seguida de dígitos al final
  const match = folioventa.match(/([A-Z])(\d+)$/);
  if (match) {
    return `${match[1]}${match[2]}`;
  }
  return folioventa;
};

/**
 * Debounce para inputs
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
