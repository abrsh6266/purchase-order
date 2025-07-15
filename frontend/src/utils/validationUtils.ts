import { PurchaseOrderStatus, TransactionType, TransactionOrigin, ShipVia } from '../types/common';

/**
 * Validation rules for common fields
 */
export const validationRules = {
  required: (message = 'This field is required') => ({
    required: true,
    message,
  }),
  
  email: {
    type: 'email' as const,
    message: 'Please enter a valid email address',
  },
  
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number',
  },
  
  url: {
    type: 'url' as const,
    message: 'Please enter a valid URL',
  },
  
  minLength: (min: number, message?: string) => ({
    min,
    message: message || `Minimum length is ${min} characters`,
  }),
  
  maxLength: (max: number, message?: string) => ({
    max,
    message: message || `Maximum length is ${max} characters`,
  }),
  
  range: (min: number, max: number, message?: string) => ({
    min,
    max,
    message: message || `Value must be between ${min} and ${max}`,
  }),
};

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate purchase order number format
 */
export const isValidPONumber = (poNumber: string): boolean => {
  // PO number should be alphanumeric and at least 3 characters
  const poRegex = /^[A-Z0-9]{3,}$/i;
  return poRegex.test(poNumber);
};

/**
 * Validate vendor name
 */
export const isValidVendorName = (vendorName: string): boolean => {
  // Vendor name should be at least 2 characters and contain only letters, spaces, and common punctuation
  const vendorRegex = /^[a-zA-Z\s\-'&.,]{2,}$/;
  return vendorRegex.test(vendorName.trim());
};

/**
 * Validate quantity (must be positive number)
 */
export const isValidQuantity = (quantity: number | string): boolean => {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

/**
 * Validate unit price (must be non-negative number)
 */
export const isValidUnitPrice = (price: number | string): boolean => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num >= 0;
};

/**
 * Validate total amount (must be non-negative number)
 */
export const isValidAmount = (amount: number | string): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num >= 0;
};

/**
 * Validate purchase order status
 */
export const isValidPurchaseOrderStatus = (status: string): status is PurchaseOrderStatus => {
  return Object.values(PurchaseOrderStatus).includes(status as PurchaseOrderStatus);
};

/**
 * Validate transaction type
 */
export const isValidTransactionType = (type: string): type is TransactionType => {
  return Object.values(TransactionType).includes(type as TransactionType);
};

/**
 * Validate transaction origin
 */
export const isValidTransactionOrigin = (origin: string): origin is TransactionOrigin => {
  return Object.values(TransactionOrigin).includes(origin as TransactionOrigin);
};

/**
 * Validate ship via option
 */
export const isValidShipVia = (shipVia: string): shipVia is ShipVia => {
  return Object.values(ShipVia).includes(shipVia as ShipVia);
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDateFormat = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate that end date is after start date
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  
  return end > start;
};

/**
 * Validate line items array
 */
export const validateLineItems = (lineItems: Array<{ item: string; quantity: number; unitPrice: number }>): string[] => {
  const errors: string[] = [];
  
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    errors.push('At least one line item is required');
    return errors;
  }
  
  lineItems.forEach((item, index) => {
    if (!item.item || item.item.trim() === '') {
      errors.push(`Line item ${index + 1}: Item name is required`);
    }
    
    if (!isValidQuantity(item.quantity)) {
      errors.push(`Line item ${index + 1}: Quantity must be a positive integer`);
    }
    
    if (!isValidUnitPrice(item.unitPrice)) {
      errors.push(`Line item ${index + 1}: Unit price must be a non-negative number`);
    }
  });
  
  return errors;
};

/**
 * Validate purchase order data
 */
export const validatePurchaseOrder = (data: {
  vendorName: string;
  poNumber: string;
  poDate: string;
  lineItems: Array<{ item: string; quantity: number; unitPrice: number }>;
}): string[] => {
  const errors: string[] = [];
  
  if (!isValidVendorName(data.vendorName)) {
    errors.push('Vendor name is invalid');
  }
  
  if (!isValidPONumber(data.poNumber)) {
    errors.push('Purchase order number format is invalid');
  }
  
  if (!isValidDateFormat(data.poDate)) {
    errors.push('Purchase order date format is invalid');
  }
  
  const lineItemErrors = validateLineItems(data.lineItems);
  errors.push(...lineItemErrors);
  
  return errors;
};

/**
 * Validate search filters
 */
export const validateSearchFilters = (filters: {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}): string[] => {
  const errors: string[] = [];
  
  if (filters.startDate && !isValidDateFormat(filters.startDate)) {
    errors.push('Start date format is invalid');
  }
  
  if (filters.endDate && !isValidDateFormat(filters.endDate)) {
    errors.push('End date format is invalid');
  }
  
  if (filters.startDate && filters.endDate && !isValidDateRange(filters.startDate, filters.endDate)) {
    errors.push('End date must be after start date');
  }
  
  if (filters.minAmount !== undefined && !isValidAmount(filters.minAmount)) {
    errors.push('Minimum amount must be a non-negative number');
  }
  
  if (filters.maxAmount !== undefined && !isValidAmount(filters.maxAmount)) {
    errors.push('Maximum amount must be a non-negative number');
  }
  
  if (filters.minAmount !== undefined && filters.maxAmount !== undefined && filters.minAmount > filters.maxAmount) {
    errors.push('Minimum amount cannot be greater than maximum amount');
  }
  
  return errors;
};

/**
 * Sanitize input string (remove dangerous characters)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate and sanitize text input
 */
export const validateAndSanitizeText = (text: string, maxLength = 1000): { isValid: boolean; sanitized: string; error?: string } => {
  const sanitized = sanitizeInput(text);
  
  if (sanitized.length === 0) {
    return { isValid: false, sanitized, error: 'Text cannot be empty' };
  }
  
  if (sanitized.length > maxLength) {
    return { isValid: false, sanitized, error: `Text cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true, sanitized };
}; 