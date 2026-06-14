'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { PriceTable } from '@/components/prices/PriceTable'
import { CSVUpload } from '@/components/prices/CSVUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import type { StockPrice } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'
import { Save } from 'lucide-react'

export default function PricesPage() {
  const { data: initialPrices, mutate } = useSWR<StockPrice[]>('prices', () => adminApi.prices.list())
  const [prices, setPrices] = useState<StockPrice[] | null>(null)
  const [tradingDate, setTradingDate] = useState(() => new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const displayPrices = prices ?? initialPrices ?? []
  const lastUpdated = initialPrices?.[0]?.updatedAt

  function handleChange(updated: StockPrice[]) {
    setPrices(updated)
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      await adminApi.prices.bulkUpdate(
        displayPrices.map((p) => ({
          symbol: p.symbol,
          currentPrice: p.currentPrice,
          prevClose: p.prevClose,
          volume: p.volume,
        }))
      )
      setMessage({ type: 'success', text: 'Prices saved successfully' })
      mutate()
      setPrices(null)
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Stock Prices</h1>
          <p className="text-sm text-muted-foreground">
            {lastUpdated ? `Last updated: ${formatDateTime(lastUpdated)}` : 'Loading…'}
          </p>
        </div>
        <CSVUpload onConfirm={() => { mutate(); setPrices(null) }} />
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'destructive'}>
          {message.text}
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="tradingDate" className="text-sm shrink-0">Trading Date</Label>
          <Input
            id="tradingDate"
            type="date"
            value={tradingDate}
            onChange={(e) => setTradingDate(e.target.value)}
            className="w-40 h-8 text-xs"
          />
        </div>
      </div>

      <PriceTable prices={displayPrices} onChange={handleChange} />

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} disabled={displayPrices.length === 0}>
          <Save className="size-4" />
          Save All Prices
        </Button>
      </div>
    </div>
  )
}
