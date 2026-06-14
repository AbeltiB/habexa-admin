'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { StockPrice } from '@/lib/types'

interface PriceTableProps {
  prices: StockPrice[]
  onChange: (prices: StockPrice[]) => void
}

export function PriceTable({ prices, onChange }: PriceTableProps) {
  function update(index: number, field: 'currentPrice' | 'volume', value: string) {
    const num = parseFloat(value)
    if (isNaN(num)) return
    const next = prices.map((p, i) => (i === index ? { ...p, [field]: num } : p))
    onChange(next)
  }

  const change = (p: StockPrice) =>
    p.prevClose ? ((p.currentPrice - p.prevClose) / p.prevClose) * 100 : 0

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company (EN)</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company (AM)</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Price (ETB)</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prev Close</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volume</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {prices.map((p, i) => {
            const chg = change(p)
            return (
              <tr key={p.symbol}>
                <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{p.symbol}</td>
                <td className="px-4 py-2.5">{p.companyEn}</td>
                <td className="px-4 py-2.5">{p.companyAm}</td>
                <td className="px-4 py-2.5 w-36">
                  <Input
                    type="number"
                    step="0.01"
                    value={p.currentPrice}
                    onChange={(e) => update(i, 'currentPrice', e.target.value)}
                    className="h-7 text-xs"
                  />
                </td>
                <td className="px-4 py-2.5 text-muted-foreground font-mono">{p.prevClose.toFixed(2)}</td>
                <td className={cn('px-4 py-2.5 font-mono text-xs font-medium', chg >= 0 ? 'text-success' : 'text-destructive')}>
                  {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                </td>
                <td className="px-4 py-2.5 w-32">
                  <Input
                    type="number"
                    value={p.volume}
                    onChange={(e) => update(i, 'volume', e.target.value)}
                    className="h-7 text-xs"
                  />
                </td>
              </tr>
            )
          })}
          {prices.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No prices loaded</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
