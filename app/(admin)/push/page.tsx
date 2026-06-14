'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'
import { Send, Bell } from 'lucide-react'
import type { PushAudience, PushBroadcast } from '@/lib/types'

const audiences: { value: PushAudience; label: string; description: string }[] = [
  { value: 'all', label: 'All users', description: '' },
  { value: 'premium', label: 'Premium only', description: '' },
  { value: 'free', label: 'Free only', description: '' },
  { value: 'inactive', label: 'Inactive 7+ days', description: '' },
]

interface FormState {
  audience: PushAudience
  titleEn: string
  titleAm: string
  bodyEn: string
  bodyAm: string
  link: string
}

const empty: FormState = {
  audience: 'all',
  titleEn: '',
  titleAm: '',
  bodyEn: '',
  bodyAm: '',
  link: '',
}

export default function PushPage() {
  const { data: history, mutate } = useSWR<PushBroadcast[]>('push/history', () => adminApi.push.history())
  const [form, setForm] = useState<FormState>(empty)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function update(patch: Partial<FormState>) {
    setForm((f) => ({ ...f, ...patch }))
  }

  async function handleSend() {
    setSending(true)
    setResult(null)
    try {
      const { queued } = await adminApi.push.broadcast({
        audience: form.audience,
        titleEn: form.titleEn,
        titleAm: form.titleAm,
        bodyEn: form.bodyEn,
        bodyAm: form.bodyAm,
        link: form.link || undefined,
      })
      setResult({ type: 'success', text: `Queued for ${queued.toLocaleString()} users` })
      setForm(empty)
      mutate()
    } catch (e) {
      setResult({ type: 'error', text: e instanceof Error ? e.message : 'Failed to send' })
    } finally {
      setSending(false)
      setConfirmOpen(false)
    }
  }

  const canSend = form.titleEn && form.titleAm && form.bodyEn && form.bodyAm
  const selectedAudience = audiences.find((a) => a.value === form.audience)?.label ?? ''

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Push Notifications</h1>
        <p className="text-sm text-muted-foreground">Send broadcast messages to user segments</p>
      </div>

      {result && (
        <Alert variant={result.type === 'success' ? 'success' : 'destructive'}>
          {result.text}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compose</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Audience</Label>
            <div className="space-y-2">
              {audiences.map((a) => (
                <label key={a.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="audience"
                    value={a.value}
                    checked={form.audience === a.value}
                    onChange={() => update({ audience: a.value })}
                    className="accent-brand"
                  />
                  <span className="text-sm text-foreground group-hover:text-brand transition-colors">
                    {a.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="titleEn">Title (EN) *</Label>
              <Input
                id="titleEn"
                value={form.titleEn}
                onChange={(e) => update({ titleEn: e.target.value })}
                placeholder="Notification title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="titleAm">Title (AM) *</Label>
              <Input
                id="titleAm"
                value={form.titleAm}
                onChange={(e) => update({ titleAm: e.target.value })}
                placeholder="የማሳወቂያ ርዕስ"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bodyEn">Body (EN) *</Label>
              <Textarea
                id="bodyEn"
                rows={3}
                value={form.bodyEn}
                onChange={(e) => update({ bodyEn: e.target.value })}
                placeholder="Notification body text"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bodyAm">Body (AM) *</Label>
              <Textarea
                id="bodyAm"
                rows={3}
                value={form.bodyAm}
                onChange={(e) => update({ bodyAm: e.target.value })}
                placeholder="የማሳወቂያ ጽሑፍ"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              id="link"
              value={form.link}
              onChange={(e) => update({ link: e.target.value })}
              placeholder="/learn/what-is-a-share"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!canSend}
            >
              <Send className="size-4" />
              Send Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Bell className="size-4" />
          Sent History
        </h2>
        <div className="rounded-lg border border-border bg-surface divide-y divide-border">
          {!history ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : history.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications sent yet</div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">&ldquo;{h.titleEn}&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.bodyEn}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-muted-foreground">{formatDateTime(h.sentAt)}</p>
                  <p className="text-xs font-medium text-foreground mt-0.5">{h.sent.toLocaleString()} sent</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSend}
        title="Send Push Notification"
        description={`Send "${form.titleEn}" to ${selectedAudience}. This cannot be undone.`}
        confirmLabel="Send Now"
        confirmVariant="default"
        loading={sending}
      />
    </div>
  )
}
