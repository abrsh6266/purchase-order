import React from 'react';
import { Input as AntInput, InputProps as AntInputProps } from 'antd';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      },
      size: {
        default: 'h-10 px-3 py-2',
        sm: 'h-8 px-2 py-1 text-xs',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<AntInputProps, 'size' | 'variant'>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

const Input = React.forwardRef<any, InputProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    const inputVariant = error ? 'error' : variant;
    
    return (
      <AntInput
        className={clsx(inputVariants({ variant: inputVariant, size, className }))}
        ref={ref}
        status={error ? 'error' : undefined}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants }; 