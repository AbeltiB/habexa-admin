'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { adminApi } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { CheckCircle, XCircle, Phone, CreditCard, Hash } from 'lucide-react'
import type { Subscription } from '@/lib/types'

interface PendingCardProps {
  subscription: Subscription
  onAction: () => void
}

export function PendingCard({ subscription: s, onAction }: PendingCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [loading, setLoading] = useState<'confirm' | 'reject' | null>(null)

  async function handleConfirm() {
    setLoading('confirm')
    try {
      await adminApi.subscriptions.confirm(s.id)
      onAction()
    } finally {
      setLoading(null)
      setConfirming(false)
    }
  }

  async function handleReject() {
    setLoading('reject')
    try {
      await adminApi.subscriptions.reject(s.id)
      onAction()
    } finally {
      setLoading(null)
      setRejectOpen(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Phone className="size-3.5 text-muted-foreground" />
              {s.phone}
              {s.displayName && <span className="text-muted-foreground font-normal">· {s.displayName}</span>}
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CreditCard className="size-3" />
                Plan: <span className="text-foreground font-medium">{s.plan} — ETB {s.price}</span>
              </div>
              <div>Method: <span className="text-foreground">{s.method}</span></div>
              <div className="flex items-center gap-1.5">
                <Hash className="size-3" />
                <span className="font-mono text-foreground">{s.reference}</span>
              </div>
              <div>Submitted: {formatRelativeTime(s.submittedAt)}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="default"
            className="bg-success hover:bg-green-700 flex-1"
            onClick={() => setConfirming(true)}
            loading={loading === 'confirm'}
          >
            <CheckCircle className="size-3.5" />
            Confirm &amp; Activate
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => setRejectOpen(true)}
            loading={loading === 'reject'}
          >
            <XCircle className="size-3.5" />
            Reject
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleConfirm}
        title="Confirm Subscription"
        description={`Activate ${s.plan} subscription for ${s.phone}? The user will be notified.`}
        confirmLabel="Confirm & Activate"
        confirmVariant="default"
        loading={loading === 'confirm'}
      />

      <ConfirmDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        title="Reject Subscription"
        description="Are you sure? The user will be notified that their payment was not confirmed."
        confirmLabel="Reject"
        loading={loading === 'reject'}
      />
    </>
  )
}
