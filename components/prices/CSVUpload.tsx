'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { adminApi } from '@/lib/api'
import type { StockPriceUpdate } from '@/lib/types'
import { Upload, X } from 'lucide-react'

interface CSVUploadProps {
  onConfirm: () => void
}

export function CSVUpload({ onConfirm }: CSVUploadProps) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<StockPriceUpdate[] | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const { preview } = await adminApi.prices.uploadCSV(file)
      setPreview(preview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleConfirm() {
    if (!preview) return
    setSaving(true)
    try {
      await adminApi.prices.confirmCSV(preview)
      setOpen(false)
      setPreview(null)
      onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        Upload CSV
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative bg-surface rounded-xl shadow-2xl border border-border w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Upload CSV</h2>
          <button onClick={() => { setOpen(false); setPreview(null) }} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="rounded-lg bg-muted border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Expected CSV format:</p>
            <pre className="text-xs font-mono text-foreground">{`symbol,current_price,previous_close,volume\nETSL,850.00,832.00,12500\nAWBI,124.50,124.50,4300`}</pre>
          </div>

          {error && <Alert variant="destructive">{error}</Alert>}

          {!preview ? (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-brand hover:bg-blue-50 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to select a CSV file</p>
              <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              {uploading && <p className="text-xs text-brand mt-2">Uploading…</p>}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Preview ({preview.length} rows)</p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>
                      {['Symbol', 'Current Price', 'Prev Close', 'Volume'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.map((row) => (
                      <tr key={row.symbol}>
                        <td className="px-3 py-2 font-mono font-semibold">{row.symbol}</td>
                        <td className="px-3 py-2">{row.currentPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.prevClose.toFixed(2)}</td>
                        <td className="px-3 py-2">{row.volume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => { setOpen(false); setPreview(null) }}>Cancel</Button>
          {preview && (
            <Button size="sm" onClick={handleConfirm} loading={saving}>
              Confirm & Save
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
