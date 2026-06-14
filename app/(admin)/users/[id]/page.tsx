'use client'

import useSWR from 'swr'
import { use } from 'react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { UserDetail } from '@/components/users/UserDetail'
import type { UserDetail as UserDetailType } from '@/lib/types'
import { ChevronLeft } from 'lucide-react'

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: user, error } = useSWR<UserDetailType>(`users/${id}`, () => adminApi.users.get(id))

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/users" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {user ? (user.displayName || user.phone) : 'User Detail'}
          </h1>
          <p className="text-sm text-muted-foreground">{user?.phone ?? '—'}</p>
        </div>
      </div>

      {error ? (
        <div className="text-center py-16 text-muted-foreground">Failed to load user</div>
      ) : !user ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : (
        <UserDetail user={user} />
      )}
    </div>
  )
}
