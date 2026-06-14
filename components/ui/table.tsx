import { cn } from '@/lib/utils'

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50 border-b border-border">{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>
}

export function TableRow({ className, children, onClick }: { className?: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr
      className={cn('transition-colors', onClick && 'cursor-pointer hover:bg-slate-50', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableHead({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider', className)}>
      {children}
    </th>
  )
}

export function TableCell({ className, children, colSpan }: { className?: string; children: React.ReactNode; colSpan?: number }) {
  return (
    <td className={cn('px-4 py-3 text-sm text-foreground', className)} colSpan={colSpan}>
      {children}
    </td>
  )
}
