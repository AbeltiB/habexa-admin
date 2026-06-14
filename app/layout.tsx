import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Habexa Admin',
  description: 'Habexa internal operations dashboard',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
