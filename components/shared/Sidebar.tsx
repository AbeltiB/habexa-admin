'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  CreditCard,
  Users,
  Bell,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/modules', label: 'Modules', icon: BookOpen },
  { href: '/prices', label: 'Prices', icon: TrendingUp },
  { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/push', label: 'Push', icon: Bell },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="size-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">
          H
        </div>
        <span className="font-semibold text-white text-sm">Habexa Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-active-bg text-sidebar-active-fg'
                      : 'hover:bg-sidebar-hover hover:text-white'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition-colors disabled:opacity-50"
        >
          <LogOut className="size-4 shrink-0" />
          {loggingOut ? 'Logging out…' : 'Log out'}
        </button>
      </div>
    </aside>
  )
}
