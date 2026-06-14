import type {
  DashboardStats,
  RecentUser,
  Module,
  ModuleFormData,
  StockPrice,
  StockPriceUpdate,
  Subscription,
  SubscriptionStatus,
  User,
  UserDetail,
  PaginatedResponse,
  PushPayload,
  PushBroadcast,
} from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.habexa.com'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/admin${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(body || `${res.status} ${res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const adminApi = {
  dashboard: {
    stats: () => req<DashboardStats>('/dashboard/stats'),
    recentUsers: () => req<RecentUser[]>('/dashboard/recent-users'),
  },

  modules: {
    list: () => req<Module[]>('/modules'),
    get: (id: string) => req<Module>(`/modules/${id}`),
    create: (data: ModuleFormData) =>
      req<Module>('/modules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ModuleFormData>) =>
      req<Module>(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => req<void>(`/modules/${id}`, { method: 'DELETE' }),
    publish: (id: string) => req<Module>(`/modules/${id}/publish`, { method: 'PUT' }),
    unpublish: (id: string) => req<Module>(`/modules/${id}/unpublish`, { method: 'PUT' }),
  },

  prices: {
    list: () => req<StockPrice[]>('/prices'),
    bulkUpdate: (prices: StockPriceUpdate[]) =>
      req<void>('/prices', { method: 'PUT', body: JSON.stringify({ prices }) }),
    uploadCSV: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return req<{ preview: StockPriceUpdate[] }>('/prices/csv', {
        method: 'POST',
        headers: {},
        body: form,
      })
    },
    confirmCSV: (prices: StockPriceUpdate[]) =>
      req<void>('/prices/csv/confirm', { method: 'POST', body: JSON.stringify({ prices }) }),
  },

  subscriptions: {
    list: (status?: SubscriptionStatus) =>
      req<Subscription[]>(`/subscriptions${status ? `?status=${status}` : ''}`),
    confirm: (id: string) => req<void>(`/subscriptions/${id}/confirm`, { method: 'PUT' }),
    reject: (id: string) => req<void>(`/subscriptions/${id}/reject`, { method: 'PUT' }),
  },

  users: {
    list: (params?: { search?: string; filter?: string; page?: number }) => {
      const qs = new URLSearchParams(
        Object.entries(params ?? {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
      ).toString()
      return req<PaginatedResponse<User>>(`/users${qs ? `?${qs}` : ''}`)
    },
    get: (id: string) => req<UserDetail>(`/users/${id}`),
    resetPaperAccount: (id: string) =>
      req<void>(`/users/${id}/reset-paper`, { method: 'POST' }),
    cancelSubscription: (id: string) =>
      req<void>(`/users/${id}/cancel-subscription`, { method: 'POST' }),
    sendPush: (id: string, payload: Omit<PushPayload, 'audience'>) =>
      req<void>(`/users/${id}/push`, { method: 'POST', body: JSON.stringify(payload) }),
    exportData: (id: string) => req<unknown>(`/users/${id}/export`),
  },

  push: {
    broadcast: (payload: PushPayload) =>
      req<{ queued: number }>('/push/broadcast', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    history: () => req<PushBroadcast[]>('/push/history'),
  },
}
