'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Eye, EyeOff, Trash2 } from 'lucide-react'
import type { Module, ModuleTrack } from '@/lib/types'

const statusVariant = {
  Draft: 'secondary',
  Live: 'success',
  Hidden: 'default',
} as const

export default function ModulesPage() {
  const { data: modules, mutate } = useSWR<Module[]>('modules', () => adminApi.modules.list())
  const [track, setTrack] = useState<ModuleTrack | 'All'>('All')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const filtered = modules?.filter((m) => track === 'All' || m.track === track) ?? []

  async function handleDelete(id: string) {
    try {
      await adminApi.modules.delete(id)
      mutate()
    } finally {
      setDeleting(null)
    }
  }

  async function handleToggle(m: Module) {
    setToggling(m.id)
    try {
      if (m.status === 'Live') await adminApi.modules.unpublish(m.id)
      else await adminApi.modules.publish(m.id)
      mutate()
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Modules</h1>
          <p className="text-sm text-muted-foreground">{modules?.length ?? 0} total</p>
        </div>
        <Link href="/modules/new">
          <Button size="sm">
            <Plus className="size-4" />
            New Module
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Track:</span>
        {(['All', 'Foundation', 'Intermediate', 'Advanced'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTrack(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              track === t
                ? 'bg-brand text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Track</TableHead>
              <TableHead>#</TableHead>
              <TableHead>Title (EN)</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {modules == null ? 'Loading…' : 'No modules found'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <Badge variant="default" className="text-xs">{m.track}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.order}</TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{m.titleEn}</TableCell>
                  <TableCell className="text-muted-foreground">{m.type}</TableCell>
                  <TableCell>{m.isPremium ? <Badge variant="warning">Premium</Badge> : <span className="text-muted-foreground text-xs">Free</span>}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[m.status]}>{m.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/modules/${m.id}`}>
                        <button className="p-1.5 rounded text-muted-foreground hover:text-brand hover:bg-blue-50" title="Edit">
                          <Pencil className="size-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleToggle(m)}
                        disabled={toggling === m.id}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-slate-100"
                        title={m.status === 'Live' ? 'Unpublish' : 'Publish'}
                      >
                        {m.status === 'Live' ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                      <button
                        onClick={() => setDeleting(m.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleting != null}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) handleDelete(deleting) }}
        title="Delete Module"
        description="This will permanently delete the module and all its quiz questions. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
