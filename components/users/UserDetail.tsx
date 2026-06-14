'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Alert } from '@/components/ui/alert'
import { adminApi } from '@/lib/api'
import { formatDate, formatRelativeTime, formatCurrency } from '@/lib/utils'
import { RotateCcw, BanIcon, Bell, Download } from 'lucide-react'
import type { UserDetail as UserDetailType } from '@/lib/types'

interface UserDetailProps {
  user: UserDetailType
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{children}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  )
}

export function UserDetail({ user }: UserDetailProps) {
  const router = useRouter()
  const [resetOpen, setResetOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [pushOpen, setPushOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [pushData, setPushData] = useState({ titleEn: '', titleAm: '', bodyEn: '', bodyAm: '', link: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleReset() {
    setLoading('reset')
    try {
      await adminApi.users.resetPaperAccount(user.id)
      setMessage({ type: 'success', text: 'Paper account reset successfully' })
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed' })
    } finally {
      setLoading(null)
      setResetOpen(false)
    }
  }

  async function handleCancel() {
    setLoading('cancel')
    try {
      await adminApi.users.cancelSubscription(user.id)
      setMessage({ type: 'success', text: 'Subscription cancelled' })
      router.refresh()
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed' })
    } finally {
      setLoading(null)
      setCancelOpen(false)
    }
  }

  async function handleSendPush() {
    setLoading('push')
    try {
      await adminApi.users.sendPush(user.id, pushData)
      setMessage({ type: 'success', text: 'Push notification sent' })
      setPushOpen(false)
      setPushData({ titleEn: '', titleAm: '', bodyEn: '', bodyAm: '', link: '' })
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed' })
    } finally {
      setLoading(null)
    }
  }

  async function handleExport() {
    try {
      const data = await adminApi.users.exportData(user.id)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `user-${user.id}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setMessage({ type: 'error', text: 'Export failed' })
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'destructive'}>
          {message.text}
        </Alert>
      )}

      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-bold text-foreground">{user.phone}</h2>
            {user.displayName && <p className="text-muted-foreground">· {user.displayName}</p>}
          </div>
          {user.isPremium ? <Badge variant="warning">Premium</Badge> : <Badge>Free</Badge>}
        </div>
        <div className="text-xs text-muted-foreground space-x-3">
          <span>Joined: {formatDate(user.joinedAt)}</span>
          <span>Last seen: {formatRelativeTime(user.lastSeenAt)}</span>
          <span>Language: {user.language}</span>
          <span>Level: {user.level}</span>
        </div>

        <SectionLabel>Learning</SectionLabel>
        <Row label="Modules completed" value={`${user.modulesCompleted} of ${user.totalModules}`} />
        <Row label="Avg quiz score" value={`${user.avgQuizScore}%`} />
        <Row label="Current streak" value={`${user.currentStreak} days`} />

        <SectionLabel>Paper Trading</SectionLabel>
        <Row
          label="Portfolio value"
          value={
            <span>
              {formatCurrency(user.portfolioValue)}{' '}
              <span className={user.portfolioGain >= 0 ? 'text-success' : 'text-destructive'}>
                ({user.portfolioGain >= 0 ? '+' : ''}{user.portfolioGain.toFixed(2)}%)
              </span>
            </span>
          }
        />
        <Row label="Total trades" value={user.totalTrades} />
        <Row label="Current rank" value={`#${user.rank} (this week)`} />

        <SectionLabel>Subscription</SectionLabel>
        {user.subscription ? (
          <>
            <Row label="Status" value={<Badge variant={user.subscription.status === 'active' ? 'success' : 'default'}>{user.subscription.status}</Badge>} />
            <Row label="Plan" value={user.subscription.plan} />
            <Row label="Expires" value={formatDate(user.subscription.expiresAt)} />
            <Row label="Method" value={user.subscription.method} />
            <Row label="Reference" value={<span className="font-mono text-xs">{user.subscription.reference}</span>} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-2">No active subscription</p>
        )}

        <SectionLabel>Actions</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-3.5" />
            Reset Paper Account
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)} disabled={!user.subscription}>
            <BanIcon className="size-3.5" />
            Cancel Subscription
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPushOpen(true)}>
            <Bell className="size-3.5" />
            Send Push Notification
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-3.5" />
            Export User Data
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Reset Paper Account"
        description="This will clear all trades, positions and portfolio balance for this user. This cannot be undone."
        confirmLabel="Reset"
        loading={loading === 'reset'}
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Subscription"
        description="This will immediately cancel the user's active subscription. The user will lose premium access."
        confirmLabel="Cancel Subscription"
        loading={loading === 'cancel'}
      />

      <Dialog open={pushOpen} onClose={() => setPushOpen(false)}>
        <DialogHeader>
          <DialogTitle>Send Push Notification</DialogTitle>
          <DialogClose onClose={() => setPushOpen(false)} />
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Title (EN)</Label>
              <Input
                value={pushData.titleEn}
                onChange={(e) => setPushData((d) => ({ ...d, titleEn: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Title (AM)</Label>
              <Input
                value={pushData.titleAm}
                onChange={(e) => setPushData((d) => ({ ...d, titleAm: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Body (EN)</Label>
              <Textarea
                rows={2}
                value={pushData.bodyEn}
                onChange={(e) => setPushData((d) => ({ ...d, bodyEn: e.target.value }))}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Body (AM)</Label>
              <Textarea
                rows={2}
                value={pushData.bodyAm}
                onChange={(e) => setPushData((d) => ({ ...d, bodyAm: e.target.value }))}
                className="text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Link (optional)</Label>
            <Input
              value={pushData.link}
              onChange={(e) => setPushData((d) => ({ ...d, link: e.target.value }))}
              placeholder="/learn/…"
              className="h-8 text-xs"
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setPushOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSendPush} loading={loading === 'push'}>
            <Bell className="size-3.5" />
            Send
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
