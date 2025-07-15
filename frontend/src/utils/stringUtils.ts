/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word in a string
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.split(' ').map(capitalize).join(' ');
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Truncate a string to specified length with ellipsis
 */
export const truncate = (str: string, length: number, suffix = '...'): string => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Remove extra whitespace and normalize spaces
 */
export const normalizeWhitespace = (str: string): string => {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
};

/**
 * Generate a random string of specified length
 */
export const generateRandomString = (length: number, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Generate a purchase order number
 */
export const generatePONumber = (prefix = 'PO'): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = generateRandomString(3);
  return `${prefix}${timestamp}${random}`;
};

/**
 * Slugify a string (convert to URL-friendly format)
 */
export const slugify = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Extract initials from a name
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

/**
 * Mask sensitive information (like credit card numbers)
 */
export const maskSensitiveData = (data: string, visibleChars = 4, maskChar = '*'): string => {
  if (!data || data.length <= visibleChars) return data;
  const visible = data.slice(-visibleChars);
  const masked = maskChar.repeat(data.length - visibleChars);
  return masked + visible;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

/**
 * Format currency string
 */
export const formatCurrencyString = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

/**
 * Convert string to camelCase
 */
export const toCamelCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

/**
 * Convert string to kebab-case
 */
export const toKebabCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Convert string to snake_case
 */
export const toSnakeCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

/**
 * Check if string contains only letters and spaces
 */
export const isAlphaSpace = (str: string): boolean => {
  return /^[a-zA-Z\s]+$/.test(str);
};

/**
 * Check if string contains only letters, numbers, and spaces
 */
export const isAlphaNumericSpace = (str: string): boolean => {
  return /^[a-zA-Z0-9\s]+$/.test(str);
};

/**
 * Remove HTML tags from string
 */
export const stripHtml = (str: string): string => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Escape HTML special characters
 */
export const escapeHtml = (str: string): string => {
  if (!str) return '';
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
};

/**
 * Unescape HTML special characters
 */
export const unescapeHtml = (str: string): string => {
  if (!str) return '';
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g, char => htmlUnescapes[char]);
}; 