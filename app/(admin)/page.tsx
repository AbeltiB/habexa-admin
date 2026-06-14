'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { StatCard } from '@/components/shared/StatCard'
import { Alert } from '@/components/ui/alert'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import { AlertCircle, Zap } from 'lucide-react'
import type { DashboardStats, RecentUser } from '@/lib/types'

export default function DashboardPage() {
  const { data: stats, error: statsError } = useSWR<DashboardStats>(
    'dashboard/stats',
    () => adminApi.dashboard.stats()
  )
  const { data: recentUsers } = useSWR<RecentUser[]>(
    'dashboard/recent-users',
    () => adminApi.dashboard.recentUsers()
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Habexa operations overview</p>
      </div>

      {statsError && (
        <Alert variant="warning">Could not load stats — API may be unavailable</Alert>
      )}

      {stats?.pendingSubscriptions != null && stats.pendingSubscriptions > 0 && (
        <Link
          href="/subscriptions"
          className="flex items-center gap-3 rounded-lg border border-amber-200 bg-warning-light px-4 py-3 text-sm font-medium text-warning hover:bg-amber-100 transition-colors"
        >
          <Zap className="size-4 shrink-0" />
          <span>
            {stats.pendingSubscriptions} subscription{stats.pendingSubscriptions !== 1 ? 's' : ''} awaiting confirmation — click to review
          </span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Users"
          value={stats ? formatNumber(stats.totalUsers) : '—'}
          sub={stats ? `+${formatNumber(stats.newUsersToday)} today` : 'Loading…'}
        />
        <StatCard
          title="Active Today"
          value={stats ? formatNumber(stats.activeToday) : '—'}
          sub={stats ? `D7: ${stats.d7Retention.toFixed(1)}%` : 'Loading…'}
        />
        <StatCard
          title="Premium Users"
          value={stats ? formatNumber(stats.premiumUsers) : '—'}
          sub={stats ? `${stats.conversionRate.toFixed(1)}% conversion` : 'Loading…'}
        />
        <StatCard
          title="Revenue MTD"
          value={stats ? `ETB ${formatNumber(stats.revenueMTD)}` : '—'}
          sub={stats ? `${formatNumber(stats.premiumUsers)} × ETB 79` : 'Loading…'}
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Recent Registrations</h2>
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          {!recentUsers && !statsError ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : recentUsers?.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No recent registrations</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(recentUsers ?? []).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{u.phone}</td>
                    <td className="px-4 py-3">{u.displayName || <span className="text-muted-foreground italic">—</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatRelativeTime(u.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
