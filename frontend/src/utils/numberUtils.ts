/**
 * Format a number as currency
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
  currency = 'USD',
  locale = 'en-US'
): string => {
  if (amount === null || amount === undefined || amount === '') return '$0.00';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format a number with specified decimal places
 */
export const formatNumber = (
  value: number | string | null | undefined,
  decimals = 2,
  locale = 'en-US'
): string => {
  if (value === null || value === undefined || value === '') return '0';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Format a number as percentage
 */
export const formatPercentage = (
  value: number | string | null | undefined,
  decimals = 2,
  locale = 'en-US'
): string => {
  if (value === null || value === undefined || value === '') return '0%';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);
};

/**
 * Calculate the total amount from line items
 */
export const calculateTotal = (lineItems: Array<{ quantity: number; unitPrice: number }>): number => {
  return lineItems.reduce((total, item) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    return total + (quantity * unitPrice);
  }, 0);
};

/**
 * Calculate tax amount
 */
export const calculateTax = (subtotal: number, taxRate: number): number => {
  return subtotal * (taxRate / 100);
};

/**
 * Calculate total with tax
 */
export const calculateTotalWithTax = (subtotal: number, taxRate: number): number => {
  return subtotal + calculateTax(subtotal, taxRate);
};

/**
 * Round a number to specified decimal places
 */
export const roundToDecimals = (value: number, decimals = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Check if a value is a valid number
 */
export const isValidNumber = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && isFinite(num);
};

/**
 * Parse a string to number, returning null if invalid
 */
export const parseNumber = (value: string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

/**
 * Get the minimum value from an array of numbers
 */
export const getMin = (values: (number | string | null | undefined)[]): number | null => {
  const validNumbers = values
    .map(v => parseNumber(v?.toString()))
    .filter((v): v is number => v !== null);
  
  return validNumbers.length > 0 ? Math.min(...validNumbers) : null;
};

/**
 * Get the maximum value from an array of numbers
 */
export const getMax = (values: (number | string | null | undefined)[]): number | null => {
  const validNumbers = values
    .map(v => parseNumber(v?.toString()))
    .filter((v): v is number => v !== null);
  
  return validNumbers.length > 0 ? Math.max(...validNumbers) : null;
};

/**
 * Calculate the average of an array of numbers
 */
export const getAverage = (values: (number | string | null | undefined)[]): number | null => {
  const validNumbers = values
    .map(v => parseNumber(v?.toString()))
    .filter((v): v is number => v !== null);
  
  if (validNumbers.length === 0) return null;
  
  const sum = validNumbers.reduce((acc, val) => acc + val, 0);
  return sum / validNumbers.length;
};

/**
 * Calculate the sum of an array of numbers
 */
export const getSum = (values: (number | string | null | undefined)[]): number => {
  return values
    .map(v => parseNumber(v?.toString()))
    .filter((v): v is number => v !== null)
    .reduce((acc, val) => acc + val, 0);
};

/**
 * Format a number for display with appropriate units (K, M, B)
 */
export const formatCompactNumber = (
  value: number | string | null | undefined,
  locale = 'en-US'
): string => {
  if (value === null || value === undefined || value === '') return '0';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

/**
 * Convert a number to words (for invoice amounts)
 */
export const numberToWords = (num: number): string => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  
  if (num === 0) return 'zero';
  if (num < 0) return 'negative ' + numberToWords(Math.abs(num));
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '');
  }
  if (num < 1000) {
    return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' and ' + numberToWords(num % 100) : '');
  }
  if (num < 1000000) {
    return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  }
  if (num < 1000000000) {
    return numberToWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 !== 0 ? ' ' + numberToWords(num % 1000000) : '');
  }
  
  return 'number too large';
}; 