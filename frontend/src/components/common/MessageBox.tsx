import React from 'react';
import { Alert, AlertProps as AntAlertProps } from 'antd';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const messageBoxVariants = cva(
  'rounded-md border p-4',
  {
    variants: {
      variant: {
        default: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs p-3',
        lg: 'text-base p-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface MessageBoxProps
  extends Omit<AntAlertProps, 'type'>,
    VariantProps<typeof messageBoxVariants> {
  className?: string;
  showIcon?: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  className,
  variant,
  size,
  showIcon = true,
  ...props
}) => {
  const alertType = variant === 'success' ? 'success' :
                   variant === 'warning' ? 'warning' :
                   variant === 'error' ? 'error' :
                   'info';

  return (
    <Alert
      className={clsx(messageBoxVariants({ variant, size, className }))}
      type={alertType}
      showIcon={showIcon}
      {...props}
    />
  );
};

MessageBox.displayName = 'MessageBox';

export { MessageBox, messageBoxVariants }; 