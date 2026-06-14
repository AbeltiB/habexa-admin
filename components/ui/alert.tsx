import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'destructive'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
}

const styles: Record<AlertVariant, { wrapper: string; icon: React.ReactNode }> = {
  info: {
    wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />,
  },
  success: {
    wrapper: 'bg-success-light border-green-200 text-success',
    icon: <CheckCircle className="size-4 text-success shrink-0 mt-0.5" />,
  },
  warning: {
    wrapper: 'bg-warning-light border-amber-200 text-warning',
    icon: <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />,
  },
  destructive: {
    wrapper: 'bg-destructive-light border-red-200 text-destructive',
    icon: <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />,
  },
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const s = styles[variant]
  return (
    <div className={cn('flex gap-3 rounded-lg border px-4 py-3', s.wrapper, className)}>
      {s.icon}
      <div className="text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
