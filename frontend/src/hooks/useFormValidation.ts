import { useState, useCallback, useEffect } from 'react';
import { validationRules, isValidEmail, isValidPhone, isValidPONumber, isValidVendorName } from '../utils/validationUtils';

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  type?: 'email' | 'url';
  message?: string;
  validator?: (value: any) => boolean | string;
}

export interface ValidationErrors {
  [key: string]: string[];
}

export interface UseFormValidationOptions {
  initialValues: Record<string, any>;
  validationSchema?: Record<string, ValidationRule[]>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn {
  values: Record<string, any>;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  setValue: (field: string, value: any) => void;
  setValues: (values: Record<string, any>) => void;
  setError: (field: string, error: string) => void;
  setErrors: (errors: ValidationErrors) => void;
  validateField: (field: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  handleChange: (field: string) => (value: any) => void;
  handleBlur: (field: string) => () => void;
}

export const useFormValidation = ({
  initialValues,
  validationSchema = {},
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormValidationOptions): UseFormValidationReturn => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate a single field
  const validateField = useCallback((field: string): string[] => {
    const fieldErrors: string[] = [];
    const value = values[field];
    const rules = validationSchema[field] || [];

    rules.forEach((rule) => {
      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        fieldErrors.push(rule.message || validationRules.required().message);
        return;
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return;
      }

      // Min length validation
      if (rule.min && typeof value === 'string' && value.length < rule.min) {
        fieldErrors.push(rule.message || validationRules.minLength(rule.min).message);
      }

      // Max length validation
      if (rule.max && typeof value === 'string' && value.length > rule.max) {
        fieldErrors.push(rule.message || validationRules.maxLength(rule.max).message);
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message || 'Invalid format');
      }

      // Type validation
      if (rule.type === 'email' && !isValidEmail(value)) {
        fieldErrors.push(rule.message || validationRules.email.message);
      }

      if (rule.type === 'url' && !isValidUrl(value)) {
        fieldErrors.push(rule.message || validationRules.url.message);
      }

      // Custom validator
      if (rule.validator) {
        const result = rule.validator(value);
        if (result === false) {
          fieldErrors.push(rule.message || 'Invalid value');
        } else if (typeof result === 'string') {
          fieldErrors.push(result);
        }
      }
    });

    return fieldErrors;
  }, [values, validationSchema]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((field) => {
      const fieldErrors = validateField(field);
      if (fieldErrors.length > 0) {
        newErrors[field] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationSchema, validateField]);

  // Set a single value
  const setValue = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      const fieldErrors = validateField(field);
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors,
      }));
    }
  }, [validateOnChange, validateField]);

  // Set multiple values
  const setValuesHandler = useCallback((newValues: Record<string, any>) => {
    setValues(newValues);
  }, []);

  // Set a single error
  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: [error],
    }));
  }, []);

  // Set multiple errors
  const setErrorsHandler = useCallback((newErrors: ValidationErrors) => {
    setErrors(newErrors);
  }, []);

  // Handle field change
  const handleChange = useCallback((field: string) => (value: any) => {
    setValue(field, value);
  }, [setValue]);

  // Handle field blur
  const handleBlur = useCallback((field: string) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (validateOnBlur) {
      const fieldErrors = validateField(field);
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors,
      }));
    }
  }, [validateOnBlur, validateField]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0 || 
    Object.values(errors).every(fieldErrors => fieldErrors.length === 0);

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setValues: setValuesHandler,
    setError,
    setErrors: setErrorsHandler,
    validateField,
    validateForm,
    resetForm,
    handleChange,
    handleBlur,
  };
};

// Helper function for URL validation
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Predefined validation schemas for common use cases
export const validationSchemas = {
  purchaseOrder: {
    vendorName: [
      validationRules.required('Vendor name is required'),
      { validator: isValidVendorName, message: 'Invalid vendor name format' },
    ],
    poNumber: [
      validationRules.required('Purchase order number is required'),
      { validator: isValidPONumber, message: 'Invalid PO number format' },
    ],
    poDate: [
      validationRules.required('Purchase order date is required'),
    ],
  },
  
  contact: {
    email: [
      validationRules.required('Email is required'),
      validationRules.email,
    ],
    phone: [
      { validator: isValidPhone, message: 'Invalid phone number format' },
    ],
  },
  
  lineItem: {
    item: [
      validationRules.required('Item name is required'),
      validationRules.minLength(2, 'Item name must be at least 2 characters'),
    ],
    quantity: [
      validationRules.required('Quantity is required'),
      { validator: (value: any) => !isNaN(value) && value > 0, message: 'Quantity must be a positive number' },
    ],
    unitPrice: [
      validationRules.required('Unit price is required'),
      { validator: (value: any) => !isNaN(value) && value >= 0, message: 'Unit price must be a non-negative number' },
    ],
  },
}; 