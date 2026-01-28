/**
 * Utility functions for date and time operations with Mexico timezone
 * This ensures all timestamps are server-side and user-immutable
 * 
 * Important Note on Timestamps and Timezones:
 * - Date objects and timestamps (milliseconds since epoch) are UNIVERSAL and timezone-agnostic
 * - They represent the same moment in time regardless of timezone
 * - Timezone only affects how we DISPLAY or FORMAT that moment
 * - This module provides utilities to format times in Mexico timezone for business logic
 */

// Mexico timezone constant - UTC-6 (Mexico City standard time)
// Note: As of October 2022, Mexico abolished daylight saving time nationwide
// (except some border regions). Most of the country now uses UTC-6 year-round.
export const MEXICO_TIMEZONE = 'America/Mexico_City';
export const MEXICO_TIMEZONE_OFFSET = '-06:00'; // For MySQL compatibility

/**
 * Get current server time as Date object
 * Note: Date objects are universal - they represent a moment in time, not a timezone
 * Use formatting functions to display in Mexico timezone
 * @returns Date object representing current moment
 */
export const getMexicoTime = (): Date => {
  return new Date();
};

/**
 * Get current time as ISO 8601 string (always in UTC with 'Z' suffix)
 * Note: ISO timestamps are always in UTC by convention
 * @returns ISO 8601 formatted string in UTC
 */
export const getMexicoTimeISO = (): string => {
  return new Date().toISOString();
};

/**
 * Format a date for MySQL DATETIME column in Mexico timezone
 * Format: YYYY-MM-DD HH:MM:SS in Mexico timezone
 * Note: This converts the universal moment to Mexico local time for display
 * @param date Optional date to format, defaults to current time
 * @returns MySQL-formatted datetime string in Mexico timezone
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
 * Get server timestamp in milliseconds since Unix epoch
 * Note: Timestamps are UNIVERSAL and timezone-agnostic
 * They represent the same moment everywhere
 * @returns Timestamp in milliseconds
 */
export const getMexicoTimestamp = (): number => {
  return Date.now();
};

/**
 * Get time components formatted in Mexico timezone
 * This is used for generating business codes (folios, claveturno) that should
 * reflect Mexico local time
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
