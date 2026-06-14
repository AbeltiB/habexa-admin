'use client'

import useSWR from 'swr'
import { adminApi } from '@/lib/api'
import { PendingCard } from '@/components/subscriptions/PendingCard'
import { SubscriptionTable } from '@/components/subscriptions/SubscriptionTable'
import { Zap } from 'lucide-react'
import type { Subscription } from '@/lib/types'

export default function SubscriptionsPage() {
  const { data: subscriptions, mutate } = useSWR<Subscription[]>(
    'subscriptions',
    () => adminApi.subscriptions.list()
  )

  const pending = subscriptions?.filter((s) => s.status === 'pending') ?? []
  const rest = subscriptions?.filter((s) => s.status !== 'pending') ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">{subscriptions?.length ?? '—'} total</p>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-pending-light border border-purple-200 px-4 py-2.5">
            <Zap className="size-4 text-pending" />
            <span className="text-sm font-medium text-pending">
              {pending.length} subscription{pending.length !== 1 ? 's' : ''} awaiting confirmation
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((s) => (
              <PendingCard key={s.id} subscription={s} onAction={() => mutate()} />
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && subscriptions != null && (
        <div className="rounded-lg bg-success-light border border-green-200 px-4 py-2.5 text-sm text-success font-medium">
          All subscriptions confirmed — inbox clear
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">All Subscriptions</h2>
        {subscriptions == null ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
        ) : (
          <SubscriptionTable subscriptions={rest} />
        )}
      </div>
    </div>
  )
}
