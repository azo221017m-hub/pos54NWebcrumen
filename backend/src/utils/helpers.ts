import { getMexicoTimestamp } from './dateTime';

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate a unique code using server timestamp
 * Note: Timestamp is universal (timezone-agnostic), represents the same moment everywhere
 */
export const generateCode = (prefix: string = ''): string => {
  const timestamp = getMexicoTimestamp().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

/**
 * Calcula paginación
 */
export const calculatePagination = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};
