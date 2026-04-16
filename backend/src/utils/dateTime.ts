/**
 * Utility functions for date and time operations with configurable timezone
 * This ensures all timestamps are server-side and user-immutable
 * 
 * Important Note on Timestamps and Timezones:
 * - Date objects and timestamps (milliseconds since epoch) are UNIVERSAL and timezone-agnostic
 * - They represent the same moment in time regardless of timezone
 * - Timezone only affects how we DISPLAY or FORMAT that moment
 * - This module provides utilities to format times in the configured timezone for business logic
 * 
 * The timezone is configured via the TZ environment variable in the .env file.
 * Default: 'Etc/GMT+6' (UTC-6)
 */

// Timezone configured from TZ environment variable (defaults to UTC-6)
// Note: In IANA/POSIX convention, Etc/GMT+6 means UTC-6 (sign is inverted)
export const MEXICO_TIMEZONE: string = process.env.TZ || 'Etc/GMT+6';

/**
 * Compute the UTC offset string (e.g. '-06:00', '+05:30') for the configured timezone.
 * This is used for MySQL pool timezone configuration.
 */
function computeTimezoneOffset(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    const offset = tzPart?.value || 'GMT';

    if (offset === 'GMT') return '+00:00';

    const match = offset.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (match) {
      const sign = match[1];
      const hours = match[2].padStart(2, '0');
      const minutes = match[3] || '00';
      return `${sign}${hours}:${minutes}`;
    }
    return '+00:00';
  } catch {
    return '-06:00'; // Fallback to Mexico offset
  }
}

export const MEXICO_TIMEZONE_OFFSET: string = computeTimezoneOffset(MEXICO_TIMEZONE);

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
 * Format a date for MySQL DATETIME column in the configured timezone
 * Format: YYYY-MM-DD HH:MM:SS in configured timezone
 * Note: This converts the universal moment to local time for display
 * @param date Optional date to format, defaults to current time
 * @returns MySQL-formatted datetime string in Mexico timezone
 */
export const formatMySQLDateTime = (date?: Date): string => {
  const d = date || new Date();
  
  // Format using configured timezone
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
 * Validates and normalizes a datetime string to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS).
 * Accepts strings coming from HTML datetime-local inputs (YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss)
 * as well as MySQL DATETIME strings (YYYY-MM-DD HH:MM:SS).
 * Returns the normalized string or null if the input is absent or invalid.
 * @param dateStr Raw datetime string from request body
 * @returns Normalized 'YYYY-MM-DD HH:MM:SS' string or null
 */
export const normalizeDateTimeForMySQL = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;

  // Replace the ISO 'T' separator with a space to unify format
  const normalized = String(dateStr).replace('T', ' ');

  // Match 'YYYY-MM-DD HH:MM' or 'YYYY-MM-DD HH:MM:SS'
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!match) return null;

  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const hours = parseInt(match[4], 10);
  const minutes = parseInt(match[5], 10);
  const seconds = parseInt(match[6] ?? '0', 10);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;

  const ss = String(seconds).padStart(2, '0');
  return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${ss}`;
};

/**
 * Get time components formatted in the configured timezone
 * This is used for generating business codes (folios, claveturno) that should
 * reflect local time
 * @returns Object with date/time components in configured timezone
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
