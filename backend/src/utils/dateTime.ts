/**
 * Utility functions for date and time operations with Mexico timezone
 * This ensures all timestamps are server-side and user-immutable
 */

// Mexico timezone constant
export const MEXICO_TIMEZONE = 'America/Mexico_City';

/**
 * Get current date/time in Mexico timezone
 * This function ensures timestamps are server-generated and cannot be manipulated by the client
 * @returns Date object representing current time in Mexico
 */
export const getMexicoTime = (): Date => {
  // Get current time and convert to Mexico timezone
  return new Date(new Date().toLocaleString('en-US', { timeZone: MEXICO_TIMEZONE }));
};

/**
 * Get current date/time as ISO string in Mexico timezone
 * @returns ISO 8601 formatted string
 */
export const getMexicoTimeISO = (): string => {
  return getMexicoTime().toISOString();
};

/**
 * Format a date for MySQL DATETIME column (YYYY-MM-DD HH:MM:SS)
 * @param date Optional date to format, defaults to current Mexico time
 * @returns MySQL-formatted datetime string
 */
export const formatMySQLDateTime = (date?: Date): string => {
  const d = date || getMexicoTime();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Get timestamp for generating unique codes (similar to Date.now() but server-side)
 * @returns Timestamp in milliseconds
 */
export const getMexicoTimestamp = (): number => {
  return getMexicoTime().getTime();
};
