/**
 * Format a date string or Date object to a readable format
 */
export const formatDate = (date: string | Date | null | undefined, format = 'MMM DD, YYYY'): string => {
  if (!date) return '-';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format a date for API requests (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: string | Date | null | undefined | any): string => {
  if (!date) return '';
  
  try {
    // Handle dayjs objects from Ant Design DatePicker
    if (date && typeof date === 'object') {
      // Check if it's a dayjs object (has $d property)
      if (date.$d) {
        const dateObj = new Date(date.$d);
        if (isNaN(dateObj.getTime())) return '';
        return dateObj.toISOString().split('T')[0];
      }
      
      // Check if it's a dayjs object with toDate method
      if (typeof date.toDate === 'function') {
        const dateObj = date.toDate();
        if (isNaN(dateObj.getTime())) return '';
        return dateObj.toISOString().split('T')[0];
      }
      
      // Check if it's a dayjs object with format method
      if (typeof date.format === 'function') {
        return date.format('YYYY-MM-DD');
      }
    }
    
    // Handle regular Date objects or date strings
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return '';
  }
};

/**
 * Format a date and time for display
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Get relative time (e.g., "2 days ago", "1 hour ago")
 */
export const getRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

/**
 * Check if a date is today
 */
export const isToday = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  return dateObj < new Date();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  return dateObj > new Date();
};

/**
 * Get the start of the month for a given date
 */
export const getStartOfMonth = (date: string | Date = new Date()): Date => {
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
};

/**
 * Get the end of the month for a given date
 */
export const getEndOfMonth = (date: string | Date = new Date()): Date => {
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
};

/**
 * Get date range for the last N days
 */
export const getLastNDays = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
};

/**
 * Get date range for the current month
 */
export const getCurrentMonthRange = (): { start: Date; end: Date } => {
  return {
    start: getStartOfMonth(),
    end: getEndOfMonth(),
  };
};

/**
 * Validate if a string is a valid date
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Parse a date string and return Date object
 */
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Get the difference in days between two dates
 */
export const getDaysDifference = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get the difference in business days between two dates (excluding weekends)
 */
export const getBusinessDaysDifference = (date1: string | Date, date2: string | Date): number => {
  const start = new Date(date1);
  const end = new Date(date2);
  let businessDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return businessDays;
}; 