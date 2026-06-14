'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { Search } from 'lucide-react'
import type { User, UserFilter } from '@/lib/types'

interface UserTableProps {
  users: User[]
  total: number
  filter: UserFilter
  onFilterChange: (f: UserFilter) => void
  search: string
  onSearchChange: (s: string) => void
}

const filters: { value: UserFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'premium', label: 'Premium' },
  { value: 'free', label: 'Free' },
  { value: 'inactive', label: 'Inactive 14d+' },
]

export function UserTable({ users, total, filter, onFilterChange, search, onSearchChange }: UserTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by phone or name…"
            className="pl-9 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'bg-brand text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{total} user{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="w-20">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.phone}</TableCell>
                  <TableCell>{u.displayName || <span className="text-muted-foreground italic">—</span>}</TableCell>
                  <TableCell>
                    {u.isPremium ? (
                      <Badge variant="warning">Premium</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Free</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(u.joinedAt)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(u.lastSeenAt)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/users/${u.id}`}
                      className="text-xs text-brand hover:underline font-medium"
                    >
                      View →
                    </Link>
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
