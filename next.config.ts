import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'videodelivery.net' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
    ],
  },
}

export default nextConfig
