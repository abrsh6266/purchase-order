import React from 'react';
import { Spin } from 'antd';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'text-blue-500',
        primary: 'text-blue-600',
        secondary: 'text-gray-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600',
      },
      size: {
        default: 'text-base',
        sm: 'text-sm',
        lg: 'text-lg',
        xl: 'text-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface LoadingSpinnerProps
  extends VariantProps<typeof spinnerVariants> {
  className?: string;
  tip?: string;
  spinning?: boolean;
  children?: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  variant,
  size,
  tip,
  spinning = true,
  children,
}) => {
  return (
    <Spin
      className={clsx(spinnerVariants({ variant, size, className }))}
      tip={tip}
      spinning={spinning}
    >
      {children}
    </Spin>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner, spinnerVariants }; 