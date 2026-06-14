'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { adminApi } from '@/lib/api'
import { UserTable } from '@/components/users/UserTable'
import type { PaginatedResponse, User, UserFilter } from '@/lib/types'

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<UserFilter>('all')

  const key = `users?search=${search}&filter=${filter}`
  const { data } = useSWR<PaginatedResponse<User>>(key, () =>
    adminApi.users.list({ search: search || undefined, filter })
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">{data?.total ?? '—'} total</p>
      </div>

      {data == null ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : (
        <UserTable
          users={data.data}
          total={data.total}
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
        />
      )}
    </div>
  )
}
