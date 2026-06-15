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
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body?.error || `${res.status} ${res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

async function upload<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}/admin${path}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body?.error || `${res.status} ${res.statusText}`)
  }
  return res.json()
}

export const adminApi = {
  dashboard: {
    stats: () => req<{ data: DashboardStats }>('/dashboard/stats').then((r) => r.data),
    recentUsers: () => req<{ data: RecentUser[] }>('/dashboard/recent-users').then((r) => r.data),
  },

  modules: {
    list: () => req<Module[]>('/modules'),
    get: (id: string) => req<Module>(`/modules/${id}`),
    create: (data: ModuleFormData) =>
      req<Module>('/modules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ModuleFormData>) =>
      req<Module>(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => req<void>(`/modules/${id}`, { method: 'DELETE' }),
    publish: (id: string) => req<Module>(`/modules/${id}/publish`, { method: 'POST' }),
    unpublish: (id: string) => req<Module>(`/modules/${id}/unpublish`, { method: 'POST' }),
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

  upload: {
    image: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return upload<{ data: { url: string; fileId: string } }>('/upload/image', form)
    },
    thumbnail: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return upload<{ data: { url: string; fileId: string } }>('/upload/thumbnail', form)
    },
    document: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return upload<{ data: { url: string; fileId: string } }>('/upload/document', form)
    },
    videoToImageKit: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return upload<{ data: { url: string; fileId: string; embedUrl: string } }>('/upload/video/imagekit', form)
    },
    videoToYouTube: (file: File, opts: { title: string; description?: string; visibility: 'public' | 'unlisted' | 'private' }) => {
      const form = new FormData()
      form.append('file', file)
      form.append('title', opts.title)
      if (opts.description) form.append('description', opts.description)
      form.append('visibility', opts.visibility)
      return upload<{ data: { videoId: string; url: string; embedUrl: string; status: string } }>('/upload/video/youtube', form)
    },
    deleteFile: (fileId: string) =>
      req<{ data: { success: boolean } }>('/upload/file', {
        method: 'DELETE',
        body: JSON.stringify({ fileId }),
      }),
    getAuthParams: () =>
      req<{ data: { token: string; expire: number; signature: string; publicKey: string } }>('/upload/auth'),
  },
}
