export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  activeToday: number
  d7Retention: number
  premiumUsers: number
  conversionRate: number
  revenueMTD: number
  pendingSubscriptions: number
}

export interface RecentUser {
  id: string
  phone: string
  displayName: string
  joinedAt: string
}

export type ModuleTrack = 'Foundation' | 'Intermediate' | 'Advanced'
export type ModuleType = 'Video' | 'Article' | 'Interactive'
export type ModuleStatus = 'Draft' | 'Live' | 'Hidden'

export interface QuizQuestion {
  id: string
  questionEn: string
  questionAm: string
  options: Array<{ en: string; am: string }>
  correctAnswer: number
  explanationEn: string
  explanationAm: string
}

export interface Module {
  id: string
  track: ModuleTrack
  order: number
  titleEn: string
  titleAm: string
  descriptionEn: string
  descriptionAm: string
  type: ModuleType
  isPremium: boolean
  durationMin: number
  status: ModuleStatus
  thumbnailUrl?: string
  videoUrl?: string
  contentEn?: string
  contentAm?: string
  questions: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

export type ModuleFormData = Omit<Module, 'id' | 'createdAt' | 'updatedAt'>

export interface StockPrice {
  symbol: string
  companyEn: string
  companyAm: string
  currentPrice: number
  prevClose: number
  volume: number
  tradingDate: string
  updatedAt: string
}

export interface StockPriceUpdate {
  symbol: string
  currentPrice: number
  prevClose: number
  volume: number
}

export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'rejected'

export interface Subscription {
  id: string
  userId: string
  phone: string
  displayName: string
  plan: 'Monthly' | 'Annual'
  price: number
  method: string
  reference: string
  status: SubscriptionStatus
  submittedAt: string
  activatedAt?: string
  expiresAt?: string
}

export type UserFilter = 'all' | 'premium' | 'free' | 'inactive'

export interface User {
  id: string
  phone: string
  displayName: string
  isPremium: boolean
  joinedAt: string
  lastSeenAt: string
}

export interface UserDetail extends User {
  language: string
  level: string
  modulesCompleted: number
  totalModules: number
  avgQuizScore: number
  currentStreak: number
  portfolioValue: number
  portfolioGain: number
  totalTrades: number
  rank: number
  subscription?: {
    status: string
    plan: string
    expiresAt: string
    method: string
    reference: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}

export type PushAudience = 'all' | 'premium' | 'free' | 'inactive'

export interface PushPayload {
  audience: PushAudience
  titleEn: string
  titleAm: string
  bodyEn: string
  bodyAm: string
  link?: string
}

export interface PushBroadcast {
  id: string
  titleEn: string
  bodyEn: string
  audience: string
  sent: number
  sentAt: string
}
