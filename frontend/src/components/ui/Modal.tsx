import React from 'react';
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const modalVariants = cva(
  'rounded-lg shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-white',
        dark: 'bg-gray-800 text-white',
      },
      size: {
        default: 'max-w-md',
        sm: 'max-w-sm',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ModalProps
  extends AntModalProps,
    VariantProps<typeof modalVariants> {
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ className, variant, size, ...props }) => {
  return (
    <AntModal
      className={clsx(modalVariants({ variant, size, className }))}
      {...props}
    />
  );
};

Modal.displayName = 'Modal';

export { Modal, modalVariants }; 