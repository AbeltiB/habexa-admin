import { cn } from '@/lib/utils'
import { type SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm text-foreground',
      'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'appearance-none cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export { Select }
