import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  sub: string
  className?: string
}

export function StatCard({ title, value, sub, className }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-surface p-5 shadow-sm', className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}
