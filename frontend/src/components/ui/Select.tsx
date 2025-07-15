import React from 'react';
import { Select as AntSelect, SelectProps as AntSelectProps } from 'antd';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const selectVariants = cva(
  'w-full rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectProps
  extends Omit<AntSelectProps, 'size' | 'variant'>,
    VariantProps<typeof selectVariants> {
  error?: boolean;
}

const Select = React.forwardRef<any, SelectProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    const selectVariant = error ? 'error' : variant;
    
    return (
      <AntSelect
        className={clsx(selectVariants({ variant: selectVariant, size, className }))}
        ref={ref}
        status={error ? 'error' : undefined}
        {...props}
      />
    );
  }
);

Select.displayName = 'Select';

export { Select, selectVariants }; 