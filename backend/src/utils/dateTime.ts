/**
 * Utility functions for date and time operations with Mexico timezone
 * This ensures all timestamps are server-side and user-immutable
 */

// Mexico timezone constant - UTC-6 (Mexico City standard time)
// Note: Mexico observes daylight saving time from April to October (UTC-5)
export const MEXICO_TIMEZONE = 'America/Mexico_City';
export const MEXICO_TIMEZONE_OFFSET = '-06:00'; // For MySQL compatibility

/**
 * Get current date/time adjusted for Mexico timezone offset
 * This function ensures timestamps are server-generated and cannot be manipulated by the client
 * Note: Returns a Date object representing the current moment, to be used for calculations
 * @returns Date object representing current server time
 */
export const getMexicoTime = (): Date => {
  // Return current server time - MySQL NOW() handles timezone via connection config
  return new Date();
};

/**
 * Get current date/time as ISO string
 * @returns ISO 8601 formatted string
 */
export const getMexicoTimeISO = (): string => {
  return new Date().toISOString();
};

/**
 * Format a date for MySQL DATETIME column (YYYY-MM-DD HH:MM:SS)
 * Note: This formats in server's local time. MySQL connection is configured
 * to use Mexico timezone, so all NOW() and timestamp operations use Mexico time.
 * @param date Optional date to format, defaults to current time
 * @returns MySQL-formatted datetime string
 */
export const formatMySQLDateTime = (date?: Date): string => {
  const d = date || new Date();
  
  // Format using Mexico timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: MEXICO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const parts = formatter.formatToParts(d);
  
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  const hour = parts.find(p => p.type === 'hour')?.value || '';
  const minute = parts.find(p => p.type === 'minute')?.value || '';
  const second = parts.find(p => p.type === 'second')?.value || '';
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 * Get timestamp for generating unique codes
 * @returns Timestamp in milliseconds
 */
export const getMexicoTimestamp = (): number => {
  return Date.now();
};

/**
 * Get time components in Mexico timezone for generating codes
 * @returns Object with date/time components in Mexico timezone
 */
export const getMexicoTimeComponents = (): {
  year: string;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
} => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: MEXICO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const parts = formatter.formatToParts(now);
  
  return {
    year: parts.find(p => p.type === 'year')?.value || '',
    month: parts.find(p => p.type === 'month')?.value || '',
    day: parts.find(p => p.type === 'day')?.value || '',
    hours: parts.find(p => p.type === 'hour')?.value || '',
    minutes: parts.find(p => p.type === 'minute')?.value || '',
    seconds: parts.find(p => p.type === 'second')?.value || ''
  };
};
