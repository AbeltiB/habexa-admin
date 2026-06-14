'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { Subscription, SubscriptionStatus } from '@/lib/types'

interface SubscriptionTableProps {
  subscriptions: Subscription[]
}

const statusVariant = {
  active: 'success',
  expired: 'default',
  rejected: 'destructive',
  pending: 'pending',
} as const

export function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  const [filter, setFilter] = useState<SubscriptionStatus | 'all'>('active')

  const filtered = subscriptions.filter((s) => filter === 'all' || s.status === filter)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as SubscriptionStatus | 'all')}
          className="w-36 h-8 text-xs"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="rejected">Rejected</option>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.phone}</TableCell>
                  <TableCell>{s.displayName}</TableCell>
                  <TableCell>
                    {s.plan}
                    <span className="ml-1 text-xs text-muted-foreground">ETB {s.price}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{s.method}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {s.expiresAt ? formatDate(s.expiresAt) : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatRelativeTime(s.submittedAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
