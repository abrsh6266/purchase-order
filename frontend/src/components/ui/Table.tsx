import React from 'react';
import { Table as AntTable, TableProps as AntTableProps } from 'antd';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const tableVariants = cva(
  'w-full border-collapse',
  {
    variants: {
      variant: {
        default: 'bg-white border border-gray-200',
        striped: 'bg-white border border-gray-200 [&_tr:nth-child(even)]:bg-gray-50',
        bordered: 'bg-white border border-gray-200 [&_td]:border [&_td]:border-gray-200 [&_th]:border [&_th]:border-gray-200',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface TableProps<T = any>
  extends Omit<AntTableProps<T>, 'size'>,
    VariantProps<typeof tableVariants> {
  className?: string;
}

const Table = React.forwardRef<HTMLDivElement, TableProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx(tableVariants({ variant, size, className }))}>
        <AntTable
          className="w-full"
          size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'middle'}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

export { Table, tableVariants }; 